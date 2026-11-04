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

| Aspect | Python | TypeScript | Go | Rust |
|--------|--------|------------|-----|------|
| Representation | Nested `list[list[int]]` | Nested `number[][]` (`number` is float64; no integer type) | Flat row-major `struct { rows, cols int; data []int }`, element at `data[i*cols+j]` | |
| Where the shape is validated | Every operation calls `shape()` | Every operation calls `shape()` | Once, in `Zeros` / `FromRows`; unexported fields keep it valid. Hole: the zero value `Matrix{}` (0x0) | |
| Error model | `ValueError` subclasses (`RaggedMatrixError`, …) + builtin `IndexError` | One `MatrixError` class with `kind: "ragged" \| …` (string-literal union) | Sentinel errors (`ErrRagged`, …) wrapped with `%w`, matched with `errors.Is`; `Transpose` / `Shape` return no error | |
| Plain out-of-range access | `IndexError` | `undefined` (a missing row then throws `TypeError` on `[j]`) | Runtime panic (`index out of range`); `At` returns `ErrOutOfRange` instead | |
| Negative index | Wraps around (`m[-1]` is the last row), so `get()` checks bounds explicitly | `m[-1]` is `undefined` (no wrap-around); `.at(-1)` wraps | `int` is signed, so negative indices are representable and `At` checks them | |
| 2D initialization pitfall | `[[0] * c] * r` repeats one row object; use a comprehension | `Array(r).fill(Array(c).fill(0))` puts one row in every slot; use `Array.from` | None with one `make([]int, r*c)`; but a sub-slice `data[i*c:(i+1)*c]` aliases the backing array, so `Rows()` copies | |
| Copying input rows | `[list(r) for r in rows]` | `rows.map((row) => [...row])` | `append(data, row...)` into the flat slice | |
| Transpose idiom | `[list(col) for col in zip(*m)]` (`zip` truncates ragged input silently) | `m[0].map((_, j) => m.map((row) => row[j]))` | Nested index loops: `t.data[j*t.cols+i] = m.data[i*m.cols+j]` | |
| Matmul idiom | Comprehension over `transpose(b)` + `sum(x * y for x, y in zip(row, col, strict=True))` | `a.map(row => bCols.map(col => row.reduce((s, x, k) => s + x * col[k], 0)))` | Triple loop in i-k-j order (walks `b` and `c` contiguously); `Mul(a, b)` since Go has no operator overloading | |
| Reading `cases.json` | `json` + `pathlib`, dispatch with `match case["op"]` | `import cases from "../../cases.json"`, `switch (c.op)` | `encoding/json` into a tagged struct; `expected` kept as `json.RawMessage` and decoded via `reflect` to the result's type | |
