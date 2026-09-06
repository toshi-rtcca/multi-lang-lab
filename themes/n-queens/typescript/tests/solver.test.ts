import { describe, expect, test } from "bun:test";
import { readFile } from "fs/promises";
import { join, resolve } from "path";

import { parseArgs } from "../src/main";
import { formatSolutions, isSafe, NQueensError, solve } from "../src/solver";

function isValidSolution(columns: number[]): boolean {
  for (let rowA = 0; rowA < columns.length; rowA++) {
    for (let rowB = rowA + 1; rowB < columns.length; rowB++) {
      const colA = columns[rowA];
      const colB = columns[rowB];
      if (colA === colB || Math.abs(colA - colB) === Math.abs(rowA - rowB)) {
        return false;
      }
    }
  }
  return true;
}

describe("solve", () => {
  test("returns 92 solutions for n=8", () => {
    expect(solve(8).length).toBe(92);
  });

  test("all solutions are valid", () => {
    const solutions = solve(8);
    expect(solutions.every(isValidSolution)).toBe(true);
  });

  test("all solutions are distinct", () => {
    const solutions = solve(8);
    const unique = new Set(solutions.map((solution) => solution.join(",")));
    expect(unique.size).toBe(solutions.length);
  });

  test("matches the shared expected fixture", async () => {
    const repoRoot = resolve(import.meta.dir, "../../../..");
    const expected = await readFile(join(repoRoot, "shared/expected/n-queens.txt"), "utf-8");

    expect(formatSolutions(solve(8))).toBe(expected);
  });

  test("n=1 returns a single trivial solution", () => {
    expect(solve(1)).toEqual([[0]]);
  });

  test.each([2, 3])("n=%d returns no solutions", (n) => {
    expect(solve(n)).toEqual([]);
  });

  test.each([0, -1])("rejects invalid n=%d", (n) => {
    expect(() => solve(n)).toThrow(NQueensError);
  });
});

describe("isSafe", () => {
  test("detects a column conflict", () => {
    expect(isSafe([0], 1, 0)).toBe(false);
  });

  test("detects a diagonal conflict", () => {
    expect(isSafe([0], 1, 1)).toBe(false);
  });

  test("allows a non-conflicting placement", () => {
    expect(isSafe([0], 1, 2)).toBe(true);
  });
});

describe("formatSolutions", () => {
  test("includes the total count and a trailing newline", () => {
    expect(formatSolutions([[0]])).toBe("0\nTotal solutions: 1\n");
  });

  test("formats zero solutions as the count line only", () => {
    expect(formatSolutions([])).toBe("Total solutions: 0\n");
  });
});

describe("parseArgs", () => {
  test("parses --n=value", () => {
    expect(parseArgs(["--n=4"])).toEqual({ n: "4" });
  });

  test("parses --n value", () => {
    expect(parseArgs(["--n", "4"])).toEqual({ n: "4" });
  });

  test("defaults to 8 when --n is missing", () => {
    expect(parseArgs([])).toEqual({ n: "8" });
  });
});
