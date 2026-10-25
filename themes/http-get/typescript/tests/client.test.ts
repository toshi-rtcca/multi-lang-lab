import { afterAll, describe, expect, test } from "bun:test";
import cases from "../../cases.json";
import { getStatus } from "../src/client";

type Case = {
  name: string;
  path?: string;
  target?: string;
  expected_status?: number;
  expected_error?: string;
};

// Language-neutral error kinds in cases.json -> Bun error codes.
// Bun 1.4.4 uses the Node.js-style code; 1.4.2 and earlier use "ConnectionRefused".
const ERROR_CODES: Record<string, string[]> = { connect: ["ConnectionRefused", "ECONNREFUSED"] };

const ROUTES: Record<string, number> = { "/ok": 200, "/missing": 404, "/error": 500, "/redirect": 302 };

// Port 0 lets the OS pick a free port.
const server = Bun.serve({
  hostname: "127.0.0.1",
  port: 0,
  fetch(req) {
    const status = ROUTES[new URL(req.url).pathname] ?? 404;
    const headers = status === 302 ? { Location: "/ok" } : undefined;
    return new Response(null, { status, headers });
  },
});
const baseUrl = `http://127.0.0.1:${server.port}`;
afterAll(() => server.stop(true));

function closedPortUrl(): string {
  // Bind then stop to obtain a port that nothing listens on.
  const tmp = Bun.serve({ hostname: "127.0.0.1", port: 0, fetch: () => new Response() });
  const port = tmp.port;
  tmp.stop(true);
  return `http://127.0.0.1:${port}/`;
}

describe("getStatus", () => {
  for (const c of cases as Case[]) {
    test(c.name, async () => {
      if (c.expected_error) {
        const error = await getStatus(closedPortUrl(), 1000).catch((e) => e);
        // The error class differs across Bun versions (Error in 1.3, TypeError in 1.4);
        // `code` is the stable part.
        expect(error).toBeInstanceOf(Error);
        expect(ERROR_CODES[c.expected_error]).toContain(error.code);
      } else {
        expect(await getStatus(baseUrl + c.path)).toBe(c.expected_status!);
      }
    });
  }
});
