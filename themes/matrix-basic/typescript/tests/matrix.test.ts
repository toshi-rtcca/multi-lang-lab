import { describe, expect, test } from "bun:test";
import cases from "../../cases.json";
import { fromRows, get, identity, type Matrix, MatrixError, matmul, shape, transpose, zeros } from "../src/matrix";

type Case = {
  name: string;
  op: string;
  rows?: number;
  cols?: number;
  n?: number;
  m?: Matrix;
  i?: number;
  j?: number;
  a?: Matrix;
  b?: Matrix;
  expected?: unknown;
  expected_error?: string;
};

function run(c: Case): unknown {
  switch (c.op) {
    case "zeros":
      return zeros(c.rows!, c.cols!);
    case "identity":
      return identity(c.n!);
    case "shape":
      return shape(c.m!);
    case "get":
      return get(c.m!, c.i!, c.j!);
    case "transpose":
      return transpose(c.m!);
    case "matmul":
      return matmul(c.a!, c.b!);
  }
  throw new Error(`unknown op ${c.op}`);
}

describe("cases.json", () => {
  for (const c of cases as Case[]) {
    test(c.name, () => {
      if (c.expected_error !== undefined) {
        // Error kinds in cases.json are exactly MatrixError.kind values.
        let caught: unknown;
        try {
          run(c);
        } catch (e) {
          caught = e;
        }
        expect(caught).toBeInstanceOf(MatrixError);
        expect((caught as MatrixError).kind).toBe(c.expected_error as MatrixError["kind"]);
      } else {
        expect(run(c)).toEqual(c.expected);
      }
    });
  }
});

describe("2D initialization pitfall", () => {
  test("zeros rows are independent", () => {
    const m = zeros(2, 2);
    m[0][0] = 9;
    expect(m).toEqual([
      [9, 0],
      [0, 0],
    ]);
  });

  test("Array.fill shares one row (contrast)", () => {
    const m: number[][] = Array(2).fill(Array(2).fill(0));
    m[0][0] = 9;
    expect(m).toEqual([
      [9, 0],
      [9, 0],
    ]);
    expect(m[0]).toBe(m[1]);
  });

  test("fromRows copies its input", () => {
    const src = [
      [1, 2],
      [3, 4],
    ];
    const m = fromRows(src);
    src[0][0] = 99;
    expect(m).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test("plain indexing returns undefined instead of failing (why get() checks)", () => {
    const m = [[1, 2, 3]];
    expect(m[0][5]).toBeUndefined();
    expect(m[0][-1]).toBeUndefined(); // no wrap-around, unlike Python
    expect(m[0].at(-1)).toBe(3); // .at() does wrap around
  });
});

describe("properties", () => {
  const A = [
    [1, 2, 3],
    [4, 5, 6],
  ];
  const B = [
    [7, 8],
    [9, 10],
    [11, 12],
  ];

  test("transpose twice is identity", () => {
    expect(transpose(transpose(A))).toEqual(A);
  });

  test("identity is neutral on both sides", () => {
    expect(matmul(identity(2), A)).toEqual(A);
    expect(matmul(A, identity(3))).toEqual(A);
  });

  test("(AB)^T == B^T A^T", () => {
    expect(transpose(matmul(A, B))).toEqual(matmul(transpose(B), transpose(A)));
  });

  test("non-integer dimensions are invalid", () => {
    expect(() => zeros(1.5, 2)).toThrow(MatrixError);
  });
});
