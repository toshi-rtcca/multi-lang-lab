package datetime_basic

import (
	"encoding/json"
	"errors"
	"os"
	"testing"
	"time"
)

type testCase struct {
	Name          string  `json:"name"`
	Input         string  `json:"input"`
	Now           string  `json:"now"`
	Expected      *Report `json:"expected"`
	ExpectedError string  `json:"expected_error"`
}

// Map language-neutral error names to Go sentinel errors.
var errorsByName = map[string]error{
	"invalid-date": ErrInvalidDate,
}

func loadCases(t *testing.T) []testCase {
	t.Helper()
	data, err := os.ReadFile("../cases.json")
	if err != nil {
		t.Fatal(err)
	}
	var cases []testCase
	if err := json.Unmarshal(data, &cases); err != nil {
		t.Fatal(err)
	}
	return cases
}

func TestCases(t *testing.T) {
	for _, c := range loadCases(t) {
		t.Run(c.Name, func(t *testing.T) {
			// RFC3339 parsing also accepts fractional seconds. If the offset
			// matches the machine's Local zone, Parse returns a time in Local;
			// the wall clock and offset are the same either way.
			now, err := time.Parse(time.RFC3339, c.Now)
			if err != nil {
				t.Fatal(err)
			}
			got, err := Describe(c.Input, now)
			if c.ExpectedError != "" {
				want := errorsByName[c.ExpectedError]
				if !errors.Is(err, want) {
					t.Fatalf("Describe(%q) error = %v, want %v", c.Input, err, want)
				}
				return
			}
			if err != nil {
				t.Fatalf("Describe(%q) unexpected error: %v", c.Input, err)
			}
			if got != *c.Expected {
				t.Errorf("Describe(%q)\n got  %+v\n want %+v", c.Input, got, *c.Expected)
			}
		})
	}
}

func TestIsLeapYear(t *testing.T) {
	for year, want := range map[int]bool{1900: false, 2000: true, 2023: false, 2024: true} {
		if got := IsLeapYear(year); got != want {
			t.Errorf("IsLeapYear(%d) = %v, want %v", year, got, want)
		}
	}
}

func TestParseDateRejectsNonASCIIDigits(t *testing.T) {
	if _, err := ParseDate("２０２４-01-15"); !errors.Is(err, ErrInvalidDate) {
		t.Errorf("err = %v, want ErrInvalidDate", err)
	}
}
