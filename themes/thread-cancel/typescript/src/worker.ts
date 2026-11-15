// Child side: one Worker = one child "thread".
// It blocks in Atomics.wait, which the parent can interrupt through shared memory.

declare var self: Worker;

export type Start = { durationMs: number; flag: SharedArrayBuffer };

self.onmessage = (event: MessageEvent<Start>) => {
  const { durationMs, flag } = event.data;
  const cell = new Int32Array(flag);
  // Interruptible blocking wait: sleeps while cell[0] === 0, for at most durationMs.
  // While blocked, this worker's event loop does not run, so a postMessage "cancel"
  // could not reach it: the parent must signal with Atomics.store + Atomics.notify.
  const result = Atomics.wait(cell, 0, 0, durationMs);
  // "timed-out" => the full duration passed; "ok" (woken) / "not-equal" (already set) => cancelled.
  self.postMessage({ status: result === "timed-out" ? "completed" : "cancelled" });
  // The child ends itself; the parent observes this as the "close" event (its join).
  process.exit(0);
};
