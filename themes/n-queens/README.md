# N-Queens

## Task

Implement a backtracking solver for the classic 8-Queens problem: place 8
queens on an 8x8 chessboard so that no two queens attack each other (no
shared row, column, or diagonal).

The CLI command is:

```sh
n-queens [--n <N>]
```

`--n` defaults to `8`. The implementation must generalize to arbitrary N
via backtracking (not brute-force permutation checking), but N=8
correctness — exactly 92 solutions — is the hard requirement.

Each solution is printed as a line of N space-separated column indices
(the column occupied by the queen in each row), followed by a final line
with the total solution count:

```text
0 4 7 5 2 6 1 3
0 5 7 2 6 3 1 4
...
Total solutions: 92
```

See [spec.md](./spec.md) for the full CLI/output contract and the
backtracking algorithm outline.

## Learning Goals

- Implement backtracking with explicit state mutation and undo.
- Compare how each language represents and mutates in-progress search
  state (arrays, recursion frames, or persistent structures).
- Produce deterministic, byte-identical output across languages so a
  single shared fixture can validate correctness everywhere.

## Language Comparison

_To be filled in after the Python, TypeScript, Go, and Rust
implementations are complete._

| Feature | Python | TypeScript | Go | Rust |
|---------|--------|------------|-----|------|
| Mutable backtracking state | TBD | TBD | TBD | TBD |
| Recursion vs. explicit stack/loop | TBD | TBD | TBD | TBD |
| Conflict checking | TBD | TBD | TBD | TBD |
| CLI args | TBD | TBD | TBD | TBD |
