# Reverse String

## Task

Reverse a given string at the grapheme cluster level, correctly handling Unicode combining characters and emoji sequences.

## Learning Goals

- Understanding Unicode grapheme clusters vs code points
- Using language-specific libraries for Unicode text segmentation
- Handling edge cases like combining characters and ZWJ sequences

## Language Comparison

| Feature | Python | TypeScript | Go | Rust |
|---------|--------|------------|-----|------|
| Grapheme library | `grapheme` | `Intl.Segmenter` (built-in) | `github.com/rivo/uniseg` | `unicode-segmentation` |
| External dependency | Yes | No | Yes | Yes |
| Iteration style | `grapheme.graphemes(s)` | `segmenter.segment(s)` | `uniseg.NewGraphemes(s)` | `s.graphemes(true)` |
| Reverse approach | `reversed()` + `join()` | `[...].reverse().join()` | Collect to slice, reverse | `.rev().collect()` |
