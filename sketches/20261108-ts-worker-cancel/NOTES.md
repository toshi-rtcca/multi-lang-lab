# Notes: ts-worker-cancel (TypeScript / Bun 1.4.4)

Checks how to cancel one child `Worker` cooperatively after a timeout, before the
`random-sleep` theme is written. Run with `bun test` (6 tests, ~2.4 s; 10/10 runs green).

## Two cooperative strategies (both work)

| | A: `message` | B: `atomics` |
|---|---|---|
| Child wait | `setTimeout` + `onmessage` listener | `Atomics.wait(cell, 0, 0, durationMs)` on a `SharedArrayBuffer` |
| Is the worker blocked? | No: the event loop stays free | Yes: a real blocking wait |
| Cancel signal | `worker.postMessage({ kind: "cancel" })` | `Atomics.store` + `Atomics.notify` |
| Completed vs cancelled | Which callback fires first | `Atomics.wait` returns `"timed-out"` vs `"ok"` |
| Closest to | Go `select` on `ctx.Done()` / `time.After` | Python `Event.wait(timeout)`, Rust `Condvar::wait_timeout` |

- Pitfall (tested): `postMessage` **cannot** interrupt `Atomics.wait`. The message stays queued until
  the wait ends by itself, so the child reports `completed`. With a blocking wait, cancellation must
  go through shared memory.
- Python `time.sleep` / Rust `thread::sleep` can't be interrupted for the same reason. Strategy A
  works only because JS sleeps are timers on the event loop, not blocking calls.

## Parent side

- Timeout: `Promise.race([reported, timeout])`. No built-in "join with timeout".
- Join: Bun emits a `close` event on the `Worker` when it has exited. Awaiting it is the
  `thread.join()` equivalent. The child ends itself with `process.exit(0)` after reporting.
- Elapsed time: `performance.now()` (monotonic). Cancelled runs land within a few ms of `timeout_ms`.

## Forced termination (comparison only)

- `worker.terminate()` kills even a worker blocked in `Atomics.wait`: no status is reported and
  `close` still fires. None of the other theme languages can force-kill a thread or goroutine.

## Recommendation for the theme

- Use **B (`Atomics.wait`)** as the main TS implementation. It maps one-to-one to the other three
  languages: a blocking, interruptible wait and a shared cancel flag.
- Mention A in the README as the "idiomatic JS" alternative, plus `terminate()` as the forced option.
- `Atomics.wait` is allowed in workers only, not on the main thread in browsers. Bun allows it on the
  main thread too, but the theme keeps it inside the worker.
