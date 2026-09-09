import { describe, expect, test } from "bun:test";
import { readdir, readFile } from "fs/promises";
import { join, resolve } from "path";

import { LexError } from "../src/lexer";
import { EvalError, ParseError, parseAndEvaluate } from "../src/parser";

const repoRoot = resolve(import.meta.dir, "../../../..");
const fixturesDir = join(repoRoot, "shared/fixtures/recursive-descent-parser");
const expectedDir = join(repoRoot, "shared/expected/recursive-descent-parser");

describe("shared fixtures", () => {
  test("every shared fixture matches its expected output or error contract", async () => {
    const cases = (await readdir(fixturesDir)).filter((name) => name.endsWith(".txt"));
    expect(cases.length).toBeGreaterThan(0);

    for (const name of cases) {
      const expression = await readFile(join(fixturesDir, name), "utf-8");
      const expected = (await readFile(join(expectedDir, name), "utf-8")).trim();

      if (expected === "ERROR") {
        expect(() => parseAndEvaluate(expression)).toThrow();
        try {
          parseAndEvaluate(expression);
        } catch (error) {
          expect(
            error instanceof LexError || error instanceof ParseError || error instanceof EvalError,
          ).toBe(true);
        }
      } else {
        expect(parseAndEvaluate(expression)).toBe(Number(expected));
      }
    }
  });
});
