# Matrix Basic

## Task

Implement basic integer matrix operations with **standard features only** (no NumPy or other third-party libraries):
construction, shape validation, indexing, transpose, and multiplication.

| Language | Representation | API |
|----------|----------------|-----|
| Python | Nested lists, `type Matrix = list[list[int]]` | `zeros(rows, cols)`, `identity(n)`, `from_rows(rows)`, `shape(m) -> tuple[int, int]`, `get(m, i, j) -> int`, `transpose(m)`, `matmul(a, b)` |
| TypeScript | Nested arrays, `type Matrix = number[][]` | `zeros(rows, cols)`, `identity(n)`, `fromRows(rows)`, `shape(m): [number, number]`, `get(m, i, j): number`, `transpose(m)`, `matmul(a, b)` |
| Go | Flat row-major `struct Matrix { rows, cols int; data []int }` | `Zeros`, `Identity`, `FromRows(rows [][]int) (Matrix, error)`, `m.Shape() (int, int)`, `m.At(i, j int) (int, error)`, `m.Transpose()`, `Mul(a, b Matrix) (Matrix, error)`, `m.Rows() [][]int` |
| Rust | Flat row-major `struct Matrix { rows: usize, cols: usize, data: Vec<i64> }` | `zeros`, `identity`, `from_rows(&[Vec<i64>]) -> Result<Matrix, MatrixError>`, `shape()`, `get(i, j) -> Option<i64>`, `transpose()`, `matmul(&Matrix) -> Result<Matrix, MatrixError>`, `to_rows()` |

Rules:

- Elements are integers so tests compare exactly.
- Dimensions must be positive. Empty matrices (`[]`, `[[]]`) and ragged matrices (rows of different lengths) are errors.
- Negative indices are out of range in every language (Python's `m[-1]` must not leak through).
- `matmul(a, b)` requires `a`'s column count to equal `b`'s row count.
- Errors are named in `cases.json` with language-neutral kinds:
  `"invalid-dims"`, `"empty"`, `"ragged"`, `"out-of-range"`, `"dim-mismatch"`. Each language's tests map them to its own error type.
- Py/TS validate the shape inside every operation (a nested list can become ragged at any time).
  Go/Rust validate once, at construction, and keep a valid shape as a type invariant.

Out of scope: operator overloading (`A @ B`), generic element types, floating point.

Spec: [issue #45](https://github.com/toshi-rtcca/multi-lang-lab/issues/45). Sketch: [`sketches/20261103-matrix-basic/`](../../sketches/20261103-matrix-basic/).

## Test cases

See [`cases.json`](cases.json). Each case has an `op` (`zeros`, `identity`, `shape`, `get`, `transpose`, `matmul`),
its named arguments, and either `expected` or `expected_error`.
In Go and Rust, `shape` / `get` / `transpose` / `matmul` cases first build the matrix with `from_rows`,
so empty and ragged errors surface there.

Property tests live in each language's test code: transposing twice is a no-op, the identity matrix is neutral on
both sides, (AB)ᵀ = BᵀAᵀ, and writing one element never changes another row.

```sh
make py-test   # or ts-test / go-test / rs-test, or `make test` for all
```

## Language Comparison

<!-- Filled in per language. -->
