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
| AST representation | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Error handling idiom | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Mutual recursion style | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| Tokenizer style | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

_Comparison table and synthesis to be filled in once all four
implementations are complete._
