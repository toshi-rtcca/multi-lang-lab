package threadcancel

import (
	"encoding/json"
	"os"
	"testing"
	"time"
)

type testCase struct {
	Name              string `json:"name"`
	Op                string `json:"op"`
	DurationMs        int    `json:"duration_ms"`
	TimeoutMs         int    `json:"timeout_ms"`
	ExpectedStatus    string `json:"expected_status"`
	ExpectedElapsedMs int    `json:"expected_elapsed_ms"`
	ToleranceMs       int    `json:"tolerance_ms"`
	Seed              uint64 `json:"seed"`
	SeedFrom          uint64 `json:"seed_from"`
	SeedTo            uint64 `json:"seed_to"`
	Min               int    `json:"min"`
	Max               int    `json:"max"`
}

func loadCases(t *testing.T, op string) []testCase {
	t.Helper()
	data, err := os.ReadFile("../cases.json")
	if err != nil {
		t.Fatal(err)
	}
	var all []testCase
	if err := json.Unmarshal(data, &all); err != nil {
		t.Fatal(err)
	}
	var out []testCase
	for _, c := range all {
		if c.Op == op {
			out = append(out, c)
		}
	}
	return out
}

func ms(n int) time.Duration { return time.Duration(n) * time.Millisecond }

func TestRun(t *testing.T) {
	for _, c := range loadCases(t, "run") {
		t.Run(c.Name, func(t *testing.T) {
			got := RunWithTimeout(ms(c.DurationMs), ms(c.TimeoutMs))
			if got.Status != Status(c.ExpectedStatus) {
				t.Errorf("status = %q, want %q", got.Status, c.ExpectedStatus)
			}
			diff := (got.Elapsed - ms(c.ExpectedElapsedMs)).Abs()
			if diff > ms(c.ToleranceMs) {
				t.Errorf("elapsed = %v, want %dms ± %dms", got.Elapsed, c.ExpectedElapsedMs, c.ToleranceMs)
			}
		})
	}
}

func TestPick(t *testing.T) {
	for _, c := range loadCases(t, "pick") {
		t.Run(c.Name, func(t *testing.T) {
			if v := PickDuration(c.Seed); v < c.Min || v > c.Max {
				t.Errorf("PickDuration(%d) = %d, want %d..=%d", c.Seed, v, c.Min, c.Max)
			}
		})
	}
	for _, c := range loadCases(t, "pick-repeat") {
		t.Run(c.Name, func(t *testing.T) {
			if a, b := PickDuration(c.Seed), PickDuration(c.Seed); a != b {
				t.Errorf("PickDuration(%d) gave %d then %d", c.Seed, a, b)
			}
		})
	}
	for _, c := range loadCases(t, "pick-range") {
		t.Run(c.Name, func(t *testing.T) {
			for s := c.SeedFrom; s <= c.SeedTo; s++ {
				if v := PickDuration(s); v < c.Min || v > c.Max {
					t.Fatalf("PickDuration(%d) = %d, want %d..=%d", s, v, c.Min, c.Max)
				}
			}
		})
	}
}

func TestPickHitsBothEnds(t *testing.T) {
	seen := map[int]bool{}
	for s := uint64(0); s < 100_000; s++ {
		seen[PickDuration(s)] = true
	}
	if !seen[1000] || !seen[5000] {
		t.Errorf("1000 seen: %v, 5000 seen: %v", seen[1000], seen[5000])
	}
}

func TestChildHasExitedAfterReturn(t *testing.T) {
	outcome, done := run(1500*time.Millisecond, 300*time.Millisecond)
	if outcome.Status != Cancelled {
		t.Fatalf("status = %q, want cancelled", outcome.Status)
	}
	// Non-blocking receive: a closed channel yields ok == false at once.
	select {
	case _, ok := <-done:
		if ok {
			t.Error("done still had a value: the child was not joined")
		}
	default:
		t.Error("done is not closed: the child may still be running")
	}
}
