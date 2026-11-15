# Thread Cancel

## Task

Start one child thread, wait for it with a timeout, and on timeout **cancel it cooperatively**:
the parent signals, the child wakes from an interruptible wait and ends itself, and the parent joins it.
A seeded random duration and a monotonic-clock elapsed time round out the theme.

| Language | Thread model | API |
|----------|--------------|-----|
| Python | `threading.Thread` (OS thread) | `pick_duration(seed: int) -> int`, `run_with_timeout(duration_ms: int, timeout_ms: int = 3500) -> Outcome` (`Outcome` is a dataclass: `status: Literal["completed", "cancelled"]`, `elapsed_ms: int`) |
| TypeScript | `Worker` (separate isolate) | `pickDuration(seed: number): number`, `runWithTimeout(durationMs: number, timeoutMs = 3500): Promise<Outcome>` (`{ status, elapsedMs }`) |
| Go | goroutine | `PickDuration(seed uint64) int`, `RunWithTimeout(duration, timeout time.Duration) Outcome` (`Outcome{Status, Elapsed time.Duration}`) |
| Rust | `std::thread` (OS thread) | `pick_duration(seed: u64) -> u64`, `run_with_timeout(duration: Duration, timeout: Duration) -> Outcome` (`Outcome { status: Status, elapsed: Duration }`, `Status` is an enum) |

Behavior:

- `pick_duration` returns an integer in **1000..=5000 (both ends inclusive)**, deterministic for a given seed.
  The generators differ, so the same seed gives **different values in different languages**.
- The parent starts one child that "works" for `duration`, then waits at most `timeout` for it.
- Child finishes in time → `completed`.
- Timeout → the parent signals cancellation; the child leaves its interruptible wait and returns by itself → `cancelled`.
- The parent always joins the child before returning. It never leaves the child running.
- `elapsed` is measured with a monotonic clock, from just before the child starts until the join completes.
- The default timeout is 3500 ms, not a whole number of seconds, to keep cases away from boundary races.
- The child never waits with an uninterruptible sleep (`time.sleep`, `time.Sleep`, `thread::sleep`).
- Out of scope: several children, collecting results, join order.

Spec: [issue #49](https://github.com/toshi-rtcca/multi-lang-lab/issues/49).
Exploration: [`sketches/20261108-ts-worker-cancel/`](../../sketches/20261108-ts-worker-cancel/).

## Test cases

See [`cases.json`](cases.json). Ops:

| op | Fields | Check |
|----|--------|-------|
| `run` | `duration_ms`, `timeout_ms`, `expected_status`, `expected_elapsed_ms`, `tolerance_ms` | Status matches; `abs(elapsed - expected) <= tolerance` |
| `pick` | `seed`, `min`, `max` | `min <= value <= max` |
| `pick-repeat` | `seed` | Two calls give the same value |
| `pick-range` | `seed_from`, `seed_to`, `min`, `max` | Every seed in the range gives a value in `[min, max]` |

Language-specific tests (not in `cases.json`):

- After `run_with_timeout` returns, the child has exited (Python: the thread is gone from `threading.enumerate()`;
  TS: `close` has fired; Go: the done channel is closed; Rust: the closure's captured `Arc` has been dropped).
- Each language checks that both 1000 and 5000 actually appear (the upper bound is inclusive).
  This scans seeds 0..100 000: with 4001 possible values, seeds 0..=999 show a given value only about 22% of the time.
- TS only: `worker.terminate()` force-kills a worker blocked in `Atomics.wait` (comparison only).

```sh
make py-test   # or ts-test / go-test / rs-test, or `make test` for all
```

## Language Comparison

| Aspect | Python | TypeScript | Go | Rust |
|--------|--------|------------|-----|------|
| Thread model | OS thread; the GIL does not matter here because the child only waits | `Worker`: a separate isolate with its own event loop. No shared objects; messages are copied. Shared memory only via `SharedArrayBuffer` | goroutine (green thread scheduled by the runtime) | OS thread (`std::thread::spawn`); no async runtime |
| Force-kill from outside | Not possible | `worker.terminate()` (the child gets no chance to clean up) | Not possible | Not possible |
| Cancel signal | `threading.Event.set()` | `Atomics.store(cell, 0, 1)` + `Atomics.notify(cell, 0)` | `context.WithCancel` → `cancel()` | `mpsc::Sender<()>::send(())` |
| Interruptible wait (child) | `event.wait(timeout)` → `True` = signaled, `False` = timed out | `Atomics.wait(cell, 0, 0, ms)` → `"timed-out"` vs `"ok"` / `"not-equal"` | `select { case <-ctx.Done(): case <-time.After(d): }` | `cancel_rx.recv_timeout(d)` → `Ok` / `Err(Timeout)` / `Err(Disconnected)` |
| Uninterruptible sleep (not used) | `time.sleep()` | `Bun.sleep()` is a timer, not a block; a blocking wait (`Atomics.wait`) cannot be reached by `postMessage` | `time.Sleep()` | `thread::sleep()` |
| Wait with timeout (parent) | `thread.join(timeout)` + `is_alive()` (`join` returns `None` either way) | `Promise.race([reported, timeout])` | `select` on the done channel and `time.After(timeout)` | `done_rx.recv_timeout(timeout)`; `JoinHandle` has no join-with-timeout |
| Join | `thread.join()` | Await the worker's `close` event | Receive from the done channel (the child's last act) | `handle.join()` (returns the child's value; `Err` if it panicked) |
| Child → parent result | Shared variable written before the thread ends | `postMessage({ status })` | Value sent on a buffered `chan Status` | Return value of the closure, via `join()` |
| Seeded random | `random.Random(seed)` (Mersenne Twister) | No seedable PRNG in the language; hand-written mulberry32 | `math/rand/v2`: `rand.New(rand.NewPCG(seed, seed))` | `rand` crate: `StdRng::seed_from_u64(seed)` (ChaCha12) |
| Inclusive range 1000..=5000 | `randint(1000, 5000)` (**both ends inclusive**) | `1000 + Math.floor(r * 4001)` (`r` in `[0, 1)`) | `1000 + r.IntN(4001)` (`IntN` excludes `n`) | `random_range(1000..=5000)` (`..=` inclusive, `..` exclusive) |
| Monotonic clock | `time.monotonic()` | `performance.now()` | `time.Now()` + `time.Since(start)` (a `Time` carries a monotonic reading) | `Instant::now()` + `elapsed()` |
| Elapsed type | `int` ms (rounded) | `number` ms (fractional) | `time.Duration` | `Duration` |

### Notes

- **Python**: `Event.wait(timeout)` returns the flag, so one call both waits and tells which way it ended.
  The parent sequence is `join(timeout)` → `is_alive()` → `set()` → `join()`.
- **TypeScript**: the main implementation uses a blocking `Atomics.wait` so that it maps one-to-one to the other languages.
  Two alternatives (both tried in the sketch):
  - **(A) `setTimeout` + `postMessage`**: the child's wait is a timer on its event loop, so a `"cancel"` message can arrive.
    This is the idiomatic JS style and resembles Go's `select`.
  - **(B) `worker.terminate()`**: forced termination. No status is reported, but `close` still fires.
  - Pitfall: while a worker is blocked in `Atomics.wait`, its event loop does not run, so a `postMessage` cancel stays queued
    until the wait ends by itself. With a blocking wait, cancellation must go through shared memory.
  - `Atomics.wait` is allowed only in workers in browsers; Bun also allows it on the main thread, but the theme keeps it in the worker.
- **Go**: the parent calls `cancel()` itself after its own `time.After(timeout)` fires.
  The alternative `context.WithTimeout(ctx, timeout)` lets the child notice the deadline on its own (no explicit `cancel()` needed
  for the signal, though `defer cancel()` is still required to release the timer); here the explicit version shows the signal.
  The done channel is buffered (capacity 1) so the child's send never blocks, even if nobody is receiving.
- **Rust**: `recv_timeout` returns `Err(Disconnected)` **immediately** once every `Sender` is dropped.
  If the parent dropped `cancel_tx` too early (e.g. let it go out of scope before waiting), the child would wake at once and
  report `cancelled` without any cancel being sent. The parent therefore keeps `cancel_tx` alive until `join()`;
  the child still treats `Disconnected` as a cancel ("the parent is gone"), which is the safe reading.
  `Condvar::wait_timeout` (with a `Mutex<bool>`) is the other std option; it needs a loop for spurious wakeups.
- **Random values differ across languages** for the same seed (different algorithms), so tests check ranges and
  determinism only, never concrete values.
- **Elapsed** uses a monotonic clock everywhere, so wall-clock adjustments (NTP, manual changes) cannot affect it.
