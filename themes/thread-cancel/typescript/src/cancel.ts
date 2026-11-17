// Parent side: start one Worker, wait with a timeout, cancel cooperatively, then join.

export type Status = "completed" | "cancelled";
export type Outcome = { status: Status; elapsedMs: number };

const WORKER_URL = new URL("./worker.ts", import.meta.url);

// Resolves once the worker has fully exited. Bun's "close" event is our join().
function joined(worker: Worker): Promise<void> {
  return new Promise((resolve) => worker.addEventListener("close", () => resolve(), { once: true }));
}

/** Test hook: lets tests observe that the child had exited before runWithTimeout resolved. */
export type Hooks = { onJoined?: () => void };

export async function runWithTimeout(
  durationMs: number,
  timeoutMs = 3500,
  hooks: Hooks = {},
): Promise<Outcome> {
  const started = performance.now(); // monotonic, unlike Date.now()
  const worker = new Worker(WORKER_URL);
  const exited = joined(worker);
  const reported = new Promise<Status>((resolve) => {
    worker.onmessage = (event: MessageEvent<{ status: Status }>) => resolve(event.data.status);
  });

  // 4 bytes = one Int32 cell shared by both sides: 0 = keep going, 1 = cancel.
  const flag = new SharedArrayBuffer(4);
  worker.postMessage({ durationMs, flag });

  // There is no "join with timeout": race the child's report against a timer.
  let timer: Timer | undefined;
  const timedOut = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => resolve("timeout"), timeoutMs);
  });
  const first = await Promise.race([reported, timedOut]);
  clearTimeout(timer);

  if (first === "timeout") {
    // Cooperative cancellation: ask the child to stop (terminate() would kill it instead).
    const cell = new Int32Array(flag);
    Atomics.store(cell, 0, 1);
    Atomics.notify(cell, 0);
  }

  const status = await reported; // the child always reports its own outcome
  await exited; // never leave the child running
  hooks.onJoined?.();
  return { status, elapsedMs: performance.now() - started };
}

export { pickDuration } from "./random";
