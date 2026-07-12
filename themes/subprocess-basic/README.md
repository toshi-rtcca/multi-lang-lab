# Subprocess Basic

## Task

Run `ls -l` for a target directory through a subprocess, receive stdout, extract file sizes and filenames, and print a normalized table sorted by size.

The CLI command is:

```sh
sort-ls-l --path <path-to-directory>
```

The output contains only two columns:

```text
size   filename
```

Rows are sorted by size descending. When two files have the same size, rows are sorted by filename ascending.

## Learning Goals

- Run an operating system command from application code.
- Receive and parse stdout from a subprocess.
- Convert environment-dependent command output into a stable normalized format.
- Sort structured data with a primary and secondary key.
- Handle subprocess and input validation errors consistently.

## Language Comparison

| Feature | Python | TypeScript | Go | Rust |
|---------|--------|------------|-----|------|
| Process execution | `subprocess.run()` | Bun subprocess API | `os/exec` | `std::process::Command` |
| stdout handling | Captured text output | Captured subprocess output | `CombinedOutput` or stdout pipe | `Output.stdout` bytes |
| CLI args | `argparse` | Manual parsing or a small parser | `flag` package | Manual parsing or `clap` |
| Parsing strategy | Split `ls -l` lines into fields | Split lines and fields | Split strings after command output | UTF-8 decode then split lines |
| Sorting | `list.sort(key=...)` | `Array.prototype.sort()` | `sort.Slice` | `sort_by` |
| Error handling | Exceptions and exit codes | Thrown errors and exit codes | Explicit `error` values | `Result` and exit codes |

