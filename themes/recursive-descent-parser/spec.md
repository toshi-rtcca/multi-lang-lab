# recursive-descent-parser

## CLI Interface
```sh
recursive-descent-parser <EXPRESSION>
```

## Input
- `EXPRESSION`: a single positional argument containing an arithmetic
  expression as a string, e.g. `"1 + 2 * (3 - 4)"`.
- Supported tokens: non-negative integers, the operators `+ - * /`, and
  parentheses `(` `)`.
- Whitespace between tokens is insignificant and may appear anywhere
  (including none at all).
- Decimal numbers are not supported; only non-negative integer literals
  are valid.

## Task
Parse the expression using recursive descent and evaluate it to a single
integer result, honoring standard operator precedence (`*` and `/` bind
tighter than `+` and `-`), left-associativity for operators of equal
precedence, and explicit grouping via parentheses.

## Grammar
The grammar is expressed in EBNF. Each production maps directly to one
parsing function, so mutual recursion between `expr`/`term`/`factor`
mirrors the grammar's own recursive structure:

```ebnf
expr   = term, { ("+" | "-"), term } ;
term   = factor, { ("*" | "/"), factor } ;
factor = number | "(", expr, ")" ;
number = digit, { digit } ;
digit  = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;
```

## Tokenization
This theme uses a **separate lexer pass**: the raw input string is first
converted into a flat list of tokens (`NUMBER`, `PLUS`, `MINUS`, `STAR`,
`SLASH`, `LPAREN`, `RPAREN`, `EOF`) before parsing begins, rather than
having the parser scan characters directly.

This is a deliberate choice over inline character scanning: it keeps
"what is a valid symbol" (lexing) separate from "what is a valid
sequence of symbols" (parsing), and gives every language a small,
explicit type to model (a token enum/union) — which is itself a useful
point of comparison across languages. Whitespace is discarded during
tokenization and never reaches the parser.

## Parsing & AST
The parser builds an explicit AST rather than evaluating while parsing.
This is chosen over direct evaluation-during-parsing because it is the
more standard structure for a recursive-descent parser, and it lets each
language's AST representation (algebraic data type, class hierarchy,
interface + structs, enum) become a meaningful point of comparison.

Two node shapes are sufficient for this grammar:
- `Number(value: int)` — a literal integer.
- `BinaryOp(op: "+" | "-" | "*" | "/", left: Expr, right: Expr)` — a
  binary operation between two sub-expressions.

Each grammar production becomes one parsing function:
- `parse_expr` parses one or more `term`s joined by `+`/`-`, building a
  left-leaning chain of `BinaryOp` nodes (this is what makes `10 - 2 - 3`
  parse as `(10 - 2) - 3`, not `10 - (2 - 3)`).
- `parse_term` parses one or more `factor`s joined by `*`/`/`, same
  left-leaning construction.
- `parse_factor` parses a `number`, or `(`, recurses into `parse_expr`,
  then consumes `)`.

## Evaluation
A separate `evaluate(node)` function walks the AST: a `Number` node
evaluates to its value; a `BinaryOp` node evaluates both operands
recursively, then applies the operator. Division is integer division
that **truncates toward zero** (e.g. `-7 / 2 = -3`), matching the
default `/` behavior for integers in Go, Rust, and C, rather than
Python's floor-division `//` (e.g. Python must not use `//` directly for
this operator). Although input literals are always non-negative, a
subtraction earlier in the expression can still produce a negative
intermediate result that a later `/` divides, so this rule matters even
though no shared fixture currently exercises it. Dividing by zero is an
evaluation-time error (not a parse-time error), since the AST for
`1 / 0` is perfectly well-formed.

## Output Format
On success, print the evaluated integer result to stdout, followed by a
trailing newline. No other output is printed on success.

## Error Handling Contract
Any of the following is an error. On error, print a message to
**stderr** prefixed with `Error: ` (exact wording is implementation- and
language-specific, and is not part of the cross-language contract), and
print nothing to stdout:

- **Lexing**: an unrecognized character appears in the input (anything
  other than digits, `+ - * /`, `(`, `)`, or whitespace).
- **Parsing**: the input is empty (no tokens, or all whitespace).
- **Parsing**: an expression is missing where required (e.g. a trailing
  operator with nothing after it, or `(` immediately followed by `)`).
- **Parsing**: a `(` is never closed by a matching `)`.
- **Parsing**: tokens remain unconsumed after a complete expression has
  been parsed (e.g. a stray trailing `)`).
- **Evaluation**: division by zero.

## Exit Codes
- `0`: Success — the expression was parsed and evaluated, result printed
  to stdout.
- `1`: Error — any of the lexing, parsing, or evaluation errors above.

## Test Fixtures
Shared test cases live in `shared/fixtures/recursive-descent-parser/`
(one file per case, containing the raw expression string) with matching
files in `shared/expected/recursive-descent-parser/`.

For a **success** case, the expected file contains the exact stdout
output (the integer result). For an **error** case, the expected file
contains the literal sentinel `ERROR` — this is a marker for the test
harness, not text the program is expected to print. An error-case test
passes when the program exits with code `1` and writes a non-empty
message to stderr; the sentinel's literal content is never compared
against actual output.

| fixture | input | expected | case |
|---|---|---|---|
| `single-number` | `42` | `42` | trivial base case |
| `basic-precedence` | `1 + 2 * 3` | `7` | `*` binds tighter than `+` |
| `left-assoc-subtraction` | `10 - 2 - 3` | `5` | left-associativity |
| `left-assoc-division` | `20 / 2 / 5` | `2` | left-associativity |
| `nested-parens` | `(1 + (2 + 3) * (4 - 1))` | `16` | nested grouping |
| `whitespace-insensitive` | `  1 +2*3` | `7` | uneven whitespace |
| `readme-example` | `1 + 2 * (3 - 4)` | `-1` | the theme's own example |
| `truncating-division` | `(1 - 4) / 2` | `-1` | division truncates toward zero, not floor (`-1`, not `-2`) |
| `division-by-zero` | `1 / 0` | `ERROR` | evaluation error |
| `unbalanced-paren` | `(1 + 2` | `ERROR` | parse error |
| `trailing-tokens` | `1 + 2)` | `ERROR` | parse error |
| `empty-input` | *(empty)* | `ERROR` | parse error |
| `consecutive-operators` | `1 + * 2` | `ERROR` | parse error |
