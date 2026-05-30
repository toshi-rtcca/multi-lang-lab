# CSV Sum Average

## Task
Read a CSV file with numeric columns, compute SUM and AVG for each row, and output an augmented CSV file.

## Learning Goals
- File I/O (reading and writing files)
- CSV parsing and generation
- Numeric data aggregation

## Language Comparison

| Feature | Python | TypeScript | Go | Rust |
|---------|--------|------------|-----|------|
| CSV parsing | `csv` module | Manual parsing | `encoding/csv` | `csv` crate |
| File read | `Path.read_text()` | `Bun.file().text()` | `os.ReadFile()` | `fs::read_to_string()` |
| File write | `Path.open("w")` | `Bun.write()` | `os.WriteFile()` | `fs::write()` |
| Float format | `f"{val:.2f}"` | `toFixed(2)` | `fmt.Sprintf("%.2f", v)` | `format!("{:.2}", v)` |
| CLI args | `argparse` | Manual parsing | `flag` package | `clap` (derive) |
