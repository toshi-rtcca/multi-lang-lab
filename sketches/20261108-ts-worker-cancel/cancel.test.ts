// Sketch: one child Worker, a timeout, and cooperative cancellation in Bun.
// Times are scaled down from the theme draft (1200/4800 vs 3500) to keep the run short.
import { expect, test } from "bun:test";

type Status = "completed" | "cancelled" | "terminated";
type Mode = "message" | "atomics";

const WORKER_URL = new URL("./worker.ts", import.meta.url);
const TIMEOUT_MS = 350;
const TOLERANCE_MS = 100;

// Resolves when the worker has fully exited: Bun's "close" event is our join().
function joined(worker: Worker): Promise<void> {
  return new Promise((resolve) => worker.addEventListener("close", () => resolve(), { once: true }));
}

async function runWithTimeout(mode: Mode, durationMs: number, timeoutMs: number) {
  const started = performance.now();
  const worker = new Worker(WORKER_URL);
  const exited = joined(worker);
  const reported = new Promise<Status>((resolve) => {
    worker.onmessage = (event: MessageEvent<{ status: Status }>) => resolve(event.data.status);
  });

  const flag = new SharedArrayBuffer(4);
  worker.postMessage(
    mode === "message"
      ? { kind: "start", mode, durationMs }
      : { kind: "start", mode, durationMs, flag },
  );

  // Wait for the child's report or the timeout, whichever comes first.
  let timer: Timer | undefined;
  const timedOut = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => resolve("timeout"), timeoutMs);
  });
  const first = await Promise.race([reported, timedOut]);
  clearTimeout(timer);

  if (first === "timeout") {
    // Cooperative cancellation: ask, do not kill.
    if (mode === "message") {
      worker.postMessage({ kind: "cancel" });
    } else {
      const cell = new Int32Array(flag);
      Atomics.store(cell, 0, 1);
      Atomics.notify(cell, 0);
    }
  }

  const status = await reported; // the child always reports its own outcome
  await exited; // never leave the child running
  return { status, elapsedMs: performance.now() - started };
}

for (const mode of ["message", "atomics"] as const) {
  test(`${mode}: finishes before the timeout -> completed`, async () => {
    const r = await runWithTimeout(mode, 150, TIMEOUT_MS);
    expect(r.status).toBe("completed");
    expect(Math.abs(r.elapsedMs - 150)).toBeLessThan(TOLERANCE_MS);
  });

  test(`${mode}: exceeds the timeout -> cancelled near timeout_ms`, async () => {
    const r = await runWithTimeout(mode, 1500, TIMEOUT_MS);
    expect(r.status).toBe("cancelled");
    expect(Math.abs(r.elapsedMs - TIMEOUT_MS)).toBeLessThan(TOLERANCE_MS);
  });
}

// Pitfall check: postMessage cannot interrupt a worker blocked in Atomics.wait.
// The "cancel" message sits in the queue until the wait times out by itself.
test("atomics: postMessage does not interrupt Atomics.wait", async () => {
  const started = performance.now();
  const worker = new Worker(WORKER_URL);
  const exited = joined(worker);
  const reported = new Promise<Status>((resolve) => {
    worker.onmessage = (event) => resolve(event.data.status);
  });
  worker.postMessage({ kind: "start", mode: "atomics", durationMs: 800, flag: new SharedArrayBuffer(4) });
  setTimeout(() => worker.postMessage({ kind: "cancel" }), 200);

  expect(await reported).toBe("completed"); // the cancel was ignored
  await exited;
  expect(performance.now() - started).toBeGreaterThan(800 - TOLERANCE_MS);
});

// Comparison only: terminate() force-kills even a blocked worker. No other theme
// language can do this to a thread/goroutine. The child gets no chance to clean up.
test("terminate(): force-kills a worker blocked in Atomics.wait", async () => {
  const started = performance.now();
  const worker = new Worker(WORKER_URL);
  const exited = joined(worker);
  let reported = false;
  worker.onmessage = () => {
    reported = true;
  };
  worker.postMessage({ kind: "start", mode: "atomics", durationMs: 5000, flag: new SharedArrayBuffer(4) });

  await Bun.sleep(TIMEOUT_MS);
  worker.terminate();
  await exited;

  expect(reported).toBe(false); // the child never reported a status
  expect(Math.abs(performance.now() - started - TIMEOUT_MS)).toBeLessThan(TOLERANCE_MS);
});
