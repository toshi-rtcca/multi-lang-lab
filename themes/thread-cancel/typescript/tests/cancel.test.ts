import { describe, expect, test } from "bun:test";
import cases from "../../cases.json";
import { pickDuration, runWithTimeout, type Status } from "../src/cancel";

type Case = {
  name: string;
  op: string;
  duration_ms?: number;
  timeout_ms?: number;
  expected_status?: Status;
  expected_elapsed_ms?: number;
  tolerance_ms?: number;
  seed?: number;
  seed_from?: number;
  seed_to?: number;
  min?: number;
  max?: number;
};

const all = cases as Case[];
const byOp = (op: string) => all.filter((c) => c.op === op);
const TEST_TIMEOUT_MS = 10_000; // bun's default per-test timeout is 5 s

describe("run", () => {
  for (const c of byOp("run")) {
    test(
      c.name,
      async () => {
        const outcome = await runWithTimeout(c.duration_ms!, c.timeout_ms!);
        expect(outcome.status).toBe(c.expected_status!);
        expect(Math.abs(outcome.elapsedMs - c.expected_elapsed_ms!)).toBeLessThanOrEqual(c.tolerance_ms!);
      },
      TEST_TIMEOUT_MS,
    );
  }
});

describe("pick", () => {
  for (const c of byOp("pick")) {
    test(c.name, () => {
      const v = pickDuration(c.seed!);
      expect(v).toBeGreaterThanOrEqual(c.min!);
      expect(v).toBeLessThanOrEqual(c.max!);
    });
  }
  for (const c of byOp("pick-repeat")) {
    test(c.name, () => {
      expect(pickDuration(c.seed!)).toBe(pickDuration(c.seed!));
    });
  }
  for (const c of byOp("pick-range")) {
    test(c.name, () => {
      for (let s = c.seed_from!; s <= c.seed_to!; s++) {
        const v = pickDuration(s);
        expect(Number.isInteger(v)).toBe(true);
        expect(v >= c.min! && v <= c.max!).toBe(true);
      }
    });
  }
});

test("pick hits both ends (upper bound inclusive)", () => {
  const values = new Set<number>();
  for (let s = 0; s < 100_000; s++) values.add(pickDuration(s));
  expect(values.has(1000)).toBe(true);
  expect(values.has(5000)).toBe(true);
});

test("the child has exited (close fired) before runWithTimeout resolves", async () => {
  let joined = false;
  const pending = runWithTimeout(1500, 300, { onJoined: () => (joined = true) });
  const outcome = await pending;
  expect(outcome.status).toBe("cancelled");
  expect(joined).toBe(true);
});

// Comparison only: terminate() force-kills even a worker blocked in Atomics.wait.
// None of the other languages can do this to a thread or goroutine.
test("terminate() force-kills a worker blocked in Atomics.wait", async () => {
  const worker = new Worker(new URL("../src/worker.ts", import.meta.url));
  const exited = new Promise<void>((resolve) =>
    worker.addEventListener("close", () => resolve(), { once: true }),
  );
  let reported = false;
  worker.onmessage = () => {
    reported = true;
  };
  const started = performance.now();
  worker.postMessage({ durationMs: 5000, flag: new SharedArrayBuffer(4) });

  await Bun.sleep(300);
  worker.terminate();
  await exited;

  expect(reported).toBe(false); // the child never got to report a status
  expect(performance.now() - started).toBeLessThan(1000); // far less than 5000
});
