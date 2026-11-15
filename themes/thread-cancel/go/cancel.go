// Package threadcancel starts one child goroutine, waits for it with a timeout,
// cancels it cooperatively through a context, and joins it.
package threadcancel

import (
	"context"
	"math/rand/v2"
	"time"
)

// Status is how the child ended.
type Status string

const (
	Completed Status = "completed"
	Cancelled Status = "cancelled"
)

// Outcome is the result of RunWithTimeout.
type Outcome struct {
	Status  Status
	Elapsed time.Duration
}

const (
	minDurationMs = 1000
	maxDurationMs = 5000
)

// PickDuration returns a duration in ms within 1000..5000, both ends inclusive,
// deterministic for a given seed.
func PickDuration(seed uint64) int {
	// A private generator: the top-level rand functions use a random seed
	// that cannot be set in math/rand/v2. PCG takes two 64-bit seed words.
	r := rand.New(rand.NewPCG(seed, seed))
	// IntN(n) returns [0, n): n excluded, so +1 makes 5000 reachable.
	return minDurationMs + r.IntN(maxDurationMs-minDurationMs+1)
}

// RunWithTimeout runs one child for duration and cancels it cooperatively
// if it is still running after timeout. It always waits for the child to end.
func RunWithTimeout(duration, timeout time.Duration) Outcome {
	outcome, _ := run(duration, timeout)
	return outcome
}

// run also returns the child's done channel so tests can check it was closed.
func run(duration, timeout time.Duration) (Outcome, <-chan Status) {
	start := time.Now() // a Time carries a monotonic reading; time.Since uses it

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel() // always release the context's resources

	// Buffered so the child's send never blocks, whoever is (not) receiving.
	done := make(chan Status, 1)

	go func() {
		defer close(done) // closing done is the child's last act: our "join" signal
		// Interruptible wait. time.Sleep(duration) could not be woken by cancel().
		select {
		case <-ctx.Done():
			done <- Cancelled
		case <-time.After(duration):
			done <- Completed
		}
	}()

	var status Status
	select {
	case status = <-done:
		// Finished in time.
	case <-time.After(timeout):
		// Cooperative cancellation: ask the goroutine to stop. Go cannot kill a goroutine.
		cancel()
		status = <-done
	}
	// Join: wait until the child has closed done (it may still be between its send and close).
	for range done {
	}

	return Outcome{Status: status, Elapsed: time.Since(start)}, done
}
