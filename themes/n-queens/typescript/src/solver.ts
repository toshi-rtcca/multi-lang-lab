/**
 * Backtracking solver for the N-Queens problem.
 */

export class NQueensError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NQueensError";
  }
}

export function isSafe(columns: number[], row: number, col: number): boolean {
  for (let placedRow = 0; placedRow < row; placedRow++) {
    const placedCol = columns[placedRow];
    if (placedCol === col || Math.abs(placedCol - col) === Math.abs(placedRow - row)) {
      return false;
    }
  }
  return true;
}

export function solve(n: number): number[][] {
  if (n < 1) {
    throw new NQueensError(`n must be >= 1, got ${n}`);
  }

  const results: number[][] = [];
  const columns: number[] = new Array(n).fill(0);

  function backtrack(row: number): void {
    if (row === n) {
      results.push([...columns]);
      return;
    }
    for (let col = 0; col < n; col++) {
      if (isSafe(columns, row, col)) {
        columns[row] = col;
        backtrack(row + 1);
      }
    }
  }

  backtrack(0);
  return results;
}

export function formatSolutions(solutions: number[][]): string {
  const lines = solutions.map((solution) => solution.join(" "));
  lines.push(`Total solutions: ${solutions.length}`);
  return `${lines.join("\n")}\n`;
}
