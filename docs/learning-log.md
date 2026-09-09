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

## 2026-09-08 — recursive-descent-parser (Python)

Python's `//` is floor division, not the truncate-toward-zero integer division
that Go, Rust, and C give you for free — `-3 // 2` is `-2` in Python but `-1`
everywhere else. Since a subtraction earlier in an expression can produce a
negative intermediate result that a later `/` divides (e.g. `(1 - 4) / 2`),
relying on `//` directly would have silently made the Python reference
implementation diverge from the other three languages on that edge case. The
fix was a small sign-aware `_truncating_divide` helper (`abs(left) // abs(right)`,
negated when the operand signs differ) instead of using `//` on the raw
operands. Separately, splitting the pipeline into `tokenize` → `parse` (into
`Number`/`BinaryOp` dataclasses) → `evaluate` as three independent functions,
rather than evaluating while parsing, made each grammar production
(`parse_expr`/`parse_term`/`parse_factor`) a pure function of the token stream
with no side effects to reason about.

## 2026-09-10 — recursive-descent-parser (TypeScript)

TypeScript's discriminated unions made the AST port nearly mechanical: a
`kind: "Number" | "BinaryOp"` tag field on plain interfaces gives the compiler
enough information to narrow `Expr` inside `evaluate`'s `if (expr.kind ===
"Number")` check, with no `instanceof` or class hierarchy needed — closer to
Rust's `enum` than to Python's `@dataclass` classes, even though the runtime
representation is just a plain object literal. `Math.trunc(left / right)`
covers the truncate-toward-zero division rule for free, since JS's `/` always
produces a float and `Math.trunc` chops the fractional part toward zero
regardless of sign — no sign-aware branching like Python's `_truncating_divide`
was needed here.

## 2026-09-10 — recursive-descent-parser (Go)

Go has no sum types, so the `Expr` AST needed an interface with an
*unexported* marker method (`exprNode()`) to fake a sealed union — any type
outside this package could still implement `Expr` if the method were
exported, so the leading lowercase letter is load-bearing, not a style
choice. Evaluating the tree then requires a type switch (`switch e :=
expr.(type) { case Number: ...; case BinaryOp: ... }`) instead of the
one-line `isinstance`/`kind` check the other languages get. Go's integer `/`
already truncates toward zero per the language spec, so — unlike Python and
TypeScript — no helper function was needed at all for the division rule.

## 2026-09-10 — recursive-descent-parser (Rust)

Rust's `enum Expr { Number(i64), BinaryOp(Op, Box<Expr>, Box<Expr>) }` needs
`Box` around the recursive fields because an enum's size must be known at
compile time — an `Expr` containing an unboxed `Expr` would be infinitely
large, so indirection through the heap is required, not optional, for any
recursive data type. A single `ExprError` enum with `Lex`/`Parse`/`Eval`
variants (rather than three separate error types like Python/TypeScript)
made every stage's function signature `Result<T, ExprError>`, so the `?`
operator could propagate any of the three failure kinds through
`tokenize`/`parse`/`evaluate` without a single manual `if err != nil` check —
the sharpest contrast with Go's explicit error checking after every call.
