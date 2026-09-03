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

| Feature | Python | TypeScript | Go | Rust |
|---------|--------|------------|-----|------|
| Mutable backtracking state | Single `columns: list[int]`, mutated in place, captured by a nested closure | Same as Python: `columns: number[]` mutated in place, captured by a nested closure | `columns []int` mutated in place; the recursive closure needs the two-step `var backtrack func(int)` declaration since Go closures can't self-reference in one statement | `columns: &mut Vec<i32>` threaded explicitly through a top-level `fn` parameter — Rust closures can't easily recurse, so backtracking state is passed by mutable reference instead of captured |
| Recursion vs. explicit stack/loop | Plain recursion (nested closure) | Plain recursion (nested closure) | Plain recursion (self-referencing closure) | Plain recursion (top-level fn) |
| Conflict checking | O(row) column/diagonal scan (`is_safe`) | O(row) column/diagonal scan (`isSafe`) | O(row) column/diagonal scan (`isSafe`) | O(row) column/diagonal scan (`is_safe`) |
| CLI args | `argparse`, with `--n` parsed manually via `int()` (bypassing argparse's own int type) | Manual `argv` scan for `--n=value` / `--n value` | `flag.String` + manual `strconv.Atoi` | Manual `env::args()` scan + `.parse::<i64>()` |

Recursion depth is bounded by N (8), so none of the four needed an
explicit stack — the main structural divergence is Rust's inability to
write a self-referencing closure, which pushes the mutable backtracking
state from a captured variable (Python/TypeScript/Go) into an explicit
`&mut` parameter (Rust). None of the four implementations use
bitmask-based column/diagonal pruning; at N=8 a plain O(row) conflict
scan is fast enough that the extra complexity would work against this
theme's learning focus (clarity of the backtracking algorithm itself).
All four implementations deliberately bypass their standard library's
built-in flag/argument type validation (`argparse`'s `type=int`, Go's
`flag.Int`) in favor of manual integer parsing, since the built-in
validators exit with a different code than the spec's uniform exit-code-1
contract for an invalid `--n`.
