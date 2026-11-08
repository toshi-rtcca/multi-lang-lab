// Child side of the sketch. One Worker = one child "thread".
// The parent sends a single "start" message choosing the wait strategy.

declare var self: Worker;

type Start =
  | { kind: "start"; mode: "message"; durationMs: number }
  | { kind: "start"; mode: "atomics"; durationMs: number; flag: SharedArrayBuffer };

self.onmessage = (event: MessageEvent<Start | { kind: "cancel" }>) => {
  const msg = event.data;
  if (msg.kind === "cancel") return; // handled by waitByMessage's own listener
  if (msg.mode === "message") waitByMessage(msg.durationMs);
  else waitByAtomics(msg.durationMs, msg.flag);
};

// Strategy A: event-loop wait. The worker is NOT blocked: a timer is pending and
// the event loop stays free, so a "cancel" postMessage can be received.
function waitByMessage(durationMs: number): void {
  const timer = setTimeout(() => finish("completed"), durationMs);
  self.addEventListener("message", (event: MessageEvent) => {
    if (event.data?.kind === "cancel") {
      clearTimeout(timer);
      finish("cancelled");
    }
  });
}

// Strategy B: a real blocking, interruptible wait (closest to Python Event.wait).
// While blocked, the event loop does not run, so postMessage cannot reach us:
// cancellation must come through the shared memory + Atomics.notify.
function waitByAtomics(durationMs: number, flag: SharedArrayBuffer): void {
  const cell = new Int32Array(flag);
  // Sleeps while cell[0] === 0, for at most durationMs.
  const result = Atomics.wait(cell, 0, 0, durationMs);
  // "timed-out" => slept the full duration; "ok"/"not-equal" => cancelled.
  finish(result === "timed-out" ? "completed" : "cancelled");
}

function finish(status: "completed" | "cancelled"): void {
  self.postMessage({ status });
  // The child ends itself; the parent observes this as the "close" event (join).
  process.exit(0);
}
