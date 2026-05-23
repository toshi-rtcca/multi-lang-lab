# reverse-string

## Purpose

This theme demonstrates Unicode-aware string manipulation by reversing strings at the grapheme cluster level.

Inspired by [Rosetta Code: Reverse a string](https://rosettacode.org/wiki/Reverse_a_string)

## CLI Interface

```bash
reverse-string <input-string>
```

## Requirements

Each implementation must:

1. Accept a single positional argument `<input-string>`
2. Reverse the string at the **grapheme cluster** level (not code point level)
3. Print the reversed string to stdout with a trailing newline
4. If no argument is provided: print usage message to stderr and exit with non-zero code

### Grapheme Cluster

A grapheme cluster is a user-perceived character, which may consist of multiple Unicode code points. Combining characters must stay attached to their base character.

Reference: [Unicode Standard Annex #29: Text Segmentation](https://unicode.org/reports/tr29/)

## Examples

```bash
# ASCII
$ reverse-string "asdf"
fdsa

# Combining characters
$ reverse-string "as⃝df̅"
f̅ds⃝a

# Japanese
$ reverse-string "ようこそ,世界に!"
!に界世,そこうよ

# ZWJ emoji (family)
$ reverse-string "👨‍👩‍👧‍👦"
👨‍👩‍👧‍👦

# Error case
$ reverse-string
Usage: reverse-string <input-string>
(exit code: 1)
```

## Edge Cases

| Input | Expected Output |
|-------|-----------------|
| `""` (empty string) | `""` (empty string) |
| No argument | Usage message to stderr, exit 1 |
| `"👨‍👩‍👧‍👦"` (ZWJ sequence) | `"👨‍👩‍👧‍👦"` (unchanged, single cluster) |
| `"as⃝df̅"` | `"f̅ds⃝a"` (combining chars stay with base) |
