# Word count

## Task
Given a text file, outputs lines, words, characters, and 10 most common words in the file (and the number of their occurrences)   in decreasing frequency.

Inspired by [Word frequency from Rosseta Code](https://rosettacode.org/wiki/Word_frequency)

## Language Comparison

| Feature | Python | TypeScript | Go | Rust |
|---------|--------|------------|-----|------|
| Character count | `len(text)` | `[...text].length` | `utf8.RuneCountInString()` | `text.chars().count()` |
| Regex | `re.compile()` | `/pattern/g` | `regexp.MustCompile()` | `regex::Regex::new()` |
| Word frequency | `collections.Counter` | `Map` + `sort()` | `map` + `sort.Slice()` | `HashMap` + `sort_by()` |
| JSON output | `json.dumps()` | `JSON.stringify()` | `json.MarshalIndent()` | `serde_json` crate |
| CLI args | `argparse` | Manual parsing | `flag` package | `clap` crate (derive) |

