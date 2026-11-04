# Notes: matrix-basic (Python / plain lists)

- Representation: row-major nested lists `list[list[int]]`. Ints keep test comparisons exact.
- `[[0] * cols] * rows` repeats one row object: writing `m[0][0]` changes every row. Use a comprehension instead (both forms are tested).
- Nested lists cannot represent an empty matrix: `[]` has no column count, so 0x0 and 0x3 are indistinguishable. Empty matrices are rejected.
- Nothing stops a ragged matrix (rows of different lengths) from being built, so `shape()` validates it. `zip(*m)` would otherwise truncate silently.
- `m[i][j]` accepts negative indices (`m[-1]` is the last row), so `get()` checks bounds explicitly.
- Idioms: `zip(*m)` for transpose; matmul iterates `transpose(b)` so each column becomes a row, then `sum(x * y for x, y in zip(row, col, strict=True))`.
- Python's `@` operator (`__matmul__`) is out of scope: the sketch uses plain functions.

## Comparison points if promoted to a theme

- 2D layout: nested vs flat row-major (`Vec<T>` + `i * cols + j`); Go `[][]int` vs fixed `[N][M]int`; TS `number[][]` vs `Int32Array`
- Out-of-range access: exception / panic / `Option` (`get()`) / `undefined` in JS
- Whether the type system can enforce a rectangular shape or matching dimensions (const generics in Rust)
- Transpose idioms: `zip(*m)`, iterator adapters, plain index loops
- Operator overloading for `A @ B`: Rust `impl Mul`, none in Go/TS
- Generic element types (Rust trait bounds, Go type parameters) as an extension
