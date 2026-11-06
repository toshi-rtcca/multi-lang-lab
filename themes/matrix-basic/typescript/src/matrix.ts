// Basic integer matrix operations on row-major nested arrays.

export type Matrix = number[][];

export type MatrixErrorKind = "invalid-dims" | "empty" | "ragged" | "out-of-range" | "dim-mismatch";

// One error class with a string-literal discriminant instead of a class per kind.
export class MatrixError extends Error {
  constructor(
    readonly kind: MatrixErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "MatrixError";
  }
}

// --- construction ------------------------------------------------------------

export function zeros(rows: number, cols: number): Matrix {
  checkDims(rows, cols);
  // Not `Array(rows).fill(Array(cols).fill(0))`: fill() puts ONE row array in every slot.
  return Array.from({ length: rows }, () => Array<number>(cols).fill(0));
}

export function identity(n: number): Matrix {
  checkDims(n, n);
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
}

export function fromRows(rows: number[][]): Matrix {
  shape(rows);
  // Copy each row so the caller's arrays are not shared with the result.
  return rows.map((row) => [...row]);
}

function checkDims(rows: number, cols: number): void {
  // `number` is a float64, so integer-ness is a runtime check too.
  if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1) {
    throw new MatrixError("invalid-dims", `dimensions must be positive integers, got ${rows}x${cols}`);
  }
}

// --- shape and indexing ------------------------------------------------------

/** Return [rows, cols], validating that m is non-empty and rectangular. */
export function shape(m: Matrix): [number, number] {
  // `[]` cannot tell 0x0 from 0x3, so empty is rejected outright.
  if (m.length === 0 || m[0].length === 0) {
    throw new MatrixError("empty", "empty matrix");
  }
  const cols = m[0].length;
  m.forEach((row, i) => {
    if (row.length !== cols) {
      throw new MatrixError("ragged", `row ${i} has ${row.length} columns, expected ${cols}`);
    }
  });
  return [m.length, cols];
}

export function get(m: Matrix, i: number, j: number): number {
  const [rows, cols] = shape(m);
  // Plain m[i][j] returns undefined (or throws on a missing row) instead of an error.
  if (!(Number.isInteger(i) && Number.isInteger(j) && i >= 0 && i < rows && j >= 0 && j < cols)) {
    throw new MatrixError("out-of-range", `index (${i}, ${j}) out of range for ${rows}x${cols} matrix`);
  }
  return m[i][j];
}

// --- transpose and multiplication --------------------------------------------

export function transpose(m: Matrix): Matrix {
  shape(m);
  return m[0].map((_, j) => m.map((row) => row[j]));
}

export function matmul(a: Matrix, b: Matrix): Matrix {
  const [, innerA] = shape(a);
  const [innerB] = shape(b);
  if (innerA !== innerB) {
    throw new MatrixError("dim-mismatch", `cannot multiply: inner dimensions ${innerA} != ${innerB}`);
  }
  const bCols = transpose(b); // walk b column by column as rows
  return a.map((row) => bCols.map((col) => row.reduce((sum, x, k) => sum + x * col[k], 0)));
}
