# multi-lang-lab — Coding Agent Context

## Project purpose
Comparative multi-language implementation of identical CLI specs.
Python = reference implementation. Other languages = idiomatic reimplementation.

## Key conventions
- Each theme has spec.md — this is the source of truth, not the Python code
- Shared fixtures in shared/fixtures/, expected outputs in shared/expected/
- Never translate Python idioms literally — ask "how would a native X developer write this?"
- Docker for Go/Rust/Java; local for Python/TypeScript

## Theme status
- 01-word-count: Python ✓
- 02-csv-summary: not started
