# Learning Log

## 2026-09-03 — n-queens (Python)

Backtracking with a single mutable `columns` array (in-place, overwrite-on-recurse)
keeps the search O(1) extra space per call beyond the recursion stack — no need to
copy or explicitly "undo" a placement, since the next candidate at that row simply
overwrites the previous one. Locking the row/column iteration order (0..N-1,
depth-first) made the solution ordering deterministic, which let a single shared
`shared/expected/n-queens.txt` fixture double as both the N=8 solution-count check
and a full validity check via byte-for-byte comparison.

## 2026-09-04 — n-queens (TypeScript)

The nested-closure backtracking pattern ported over from Python almost unchanged —
a `columns: number[]` mutated in place, captured by an inner `backtrack` function.
Manual `--n=value` / `--n value` argv parsing (matching subprocess-basic's
`parseArgs` convention) was simpler than reaching for a flag-parsing library, and
kept invalid-input handling (exit code 1) fully under our control rather than
delegated to a library's own error/exit behavior.

## 2026-09-04 — n-queens (Go)

A self-referencing recursive closure in Go needs the two-step
`var backtrack func(int); backtrack = func(row int) { ... }` declaration — you
can't declare and assign a closure that calls itself in one `:=` statement,
since the closure's own name isn't in scope yet at the point of assignment.
Otherwise the backtracking logic is a direct translation of the Python/TypeScript
version, mutating a `[]int` slice in place.

## 2026-09-04 — n-queens (Rust)

Rust closures can't easily recurse (no stable name to call by from inside the
closure body), so the backtracking step became a top-level `fn` that takes
`columns: &mut Vec<i32>` and `results: &mut Vec<Vec<i32>>` as explicit
parameters instead of capturing them. This is the one language where the
"mutable state captured by a nested function" idiom used in Python/TypeScript/Go
doesn't carry over directly — the mutable state has to be threaded explicitly
through the borrow checker instead.
