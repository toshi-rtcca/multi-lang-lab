# hello-name

## Purpose

This theme demonstrates CLI argument parsing and conditional logic across languages.

## Requirements

Each implementation must:

1. Accept a `--name` CLI argument
2. If `--name` is provided: print `Hello, {name}!` to stdout
3. If `--name` is not provided: print `Sorry, may I have your name?` to stderr and exit with non-zero code

## Examples

```bash
# Success case
$ hello-name --name=World
Hello, World!

# Error case
$ hello-name
Sorry, may I have your name?
```
