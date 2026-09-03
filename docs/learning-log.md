# Learning Log

## 2026-09-03 — n-queens (Python)

Backtracking with a single mutable `columns` array (in-place, overwrite-on-recurse)
keeps the search O(1) extra space per call beyond the recursion stack — no need to
copy or explicitly "undo" a placement, since the next candidate at that row simply
overwrites the previous one. Locking the row/column iteration order (0..N-1,
depth-first) made the solution ordering deterministic, which let a single shared
`shared/expected/n-queens.txt` fixture double as both the N=8 solution-count check
and a full validity check via byte-for-byte comparison.
