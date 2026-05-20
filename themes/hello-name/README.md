# Hello Name

## Task
Accept a name via CLI argument and display a personalized greeting.

## Learning Goals
- CLI argument parsing
- Conditional logic and error handling

## Language Comparison

| Feature | Python | TypeScript | Go | Rust |
|---------|--------|------------|-----|------|
| CLI parsing | `argparse` | Manual parsing | `flag` package | `clap` (derive) |
| Optional type | `None` | `null` | Empty string `""` | `Option<String>` |
| Stderr output | `print(..., file=sys.stderr)` | `console.error()` | `fmt.Fprintln(os.Stderr, ...)` | `eprintln!()` |
| Exit | `sys.exit(1)` | `process.exit(1)` | `os.Exit(1)` | `process::exit(1)` |
