# Recursive Descent Parser

## Task

Implement a recursive-descent parser and evaluator for arithmetic
expressions supporting non-negative integers, the operators `+ - * /`,
and parentheses for grouping, with standard precedence (`*`/`/` bind
tighter than `+`/`-`) and left-associativity. Input is whitespace-
insensitive.

The CLI command is:

```sh
recursive-descent-parser "<EXPRESSION>"
```

For example:

```sh
$ recursive-descent-parser "1 + 2 * (3 - 4)"
-1
```

Invalid input (malformed syntax, unbalanced parentheses) or a division
by zero produce a clear error and a non-zero exit code instead of a
result.

See [spec.md](./spec.md) for the full grammar, tokenization/AST design
decisions, error handling contract, and test fixtures.

## Learning Goals

- Translate an EBNF grammar directly into mutually recursive parsing
  functions (`parseExpr` / `parseTerm` / `parseFactor`).
- Compare how each language represents an AST: algebraic data types,
  classes, interfaces, or enums.
- Compare error-handling idioms for a pipeline with multiple failure
  points (lexing, parsing, evaluation): exceptions, `Result`/`error`
  return values, and how each is threaded back up to the CLI layer.
- Separate a lexer, a parser, and an evaluator as three independent
  stages operating on a shared grammar.

## Language Comparison

| Feature | Python | TypeScript | Go | Rust |
|---------|--------|------------|-----|------|
| AST representation | Frozen `@dataclass` classes (`Number`, `BinaryOp`) joined by a `Union` type alias | A discriminated union: `NumberNode`/`BinaryOpNode` interfaces tagged by a `kind` field | A sealed interface (`Expr`) with an unexported `exprNode()` marker method, implemented by two structs, switched over with a type switch | An `enum Expr { Number(i64), BinaryOp(Op, Box<Expr>, Box<Expr>) }`, with a further `enum Op` for the operator itself |
| Error handling idiom | Three exception classes (`LexError`, `ParseError`, `EvalError`) raised and caught at the CLI boundary | Three `Error` subclasses, thrown and matched with `instanceof` in `main.ts` | Plain `error` return values from every function (`fmt.Errorf`); no custom error type needed | One `ExprError` enum (`Lex`/`Parse`/`Eval` variants) threaded through `Result<T, ExprError>`, propagated with `?` |
| Mutual recursion style | Three methods on a `_Parser` class (`parse_expr`/`parse_term`/`parse_factor`), each returning an `Expr` node | Three methods on a `TokenParser` class, structurally identical to Python's | Three methods on a `*parser` pointer receiver, returning `(Expr, error)` pairs that must be checked at every call site | Three private methods on a `Parser` struct, returning `Result<Expr, ExprError>` and propagated with `?` instead of manual checks |
| Tokenizer style | A single `tokenize` function building a `list[Token]` via an `Enum`-tagged dataclass | A single `tokenize` function building a `Token[]`, `TokenType` as a string union | A single `tokenize` function building a `[]Token`, `TokenType` as an `int` (`iota`) enum | A single `tokenize` function building a `Vec<Token>`, `TokenType` as a `#[derive(PartialEq, Eq)]` enum |

All four implementations share the exact same three-stage pipeline
(`tokenize` → `parse` → `evaluate`) and the same left-leaning
`BinaryOp` construction for associativity, so the differences above are
purely about each language's type system, not about algorithmic
divergence. The starkest contrast is error propagation: Go's explicit
`if err != nil` after every call is the most verbose of the four, while
Rust's `?` operator gets the same explicitness at zero syntactic cost by
threading a single `ExprError` enum through every `Result`. Python and
TypeScript converge on nearly identical designs (classes with methods,
exceptions caught at the boundary) since both are structurally similar
here; Go and Rust diverge from each other more than from either
dynamic-adjacent language, despite both being statically typed and
compiled — Go's lack of sum types forces an interface-plus-type-switch
workaround for the AST, where Rust's `enum` expresses it directly.
