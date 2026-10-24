# multi-lang-lab — Coding Agent Context

## Project purpose
Comparative multi-language implementation of identical specs.
Python = reference implementation. Other languages = idiomatic reimplementation.

Work happens on two tracks:
- **Sketch** (`sketches/`) — quick, single-language experiments to explore an idea. See `sketches/README.md`.
- **Theme** (`themes/`) — a sketch promoted to a multi-language comparison.

## Learning Focus
This project is for comparative multi-language learning.
Implementations prioritize clarity of learning points over production efficiency or optimization.

## Documentation Language Policy
- All documentation files (.md) must be written in English
- All code comments must be written in English
- User instructions/prompts to coding agents may be in Japanese

## Key conventions
- The theme's GitHub issue + `themes/{theme}/cases.json` are the source of truth, not the Python code
- Implement each theme as a function plus tests; a CLI is optional (only when I/O itself is the learning point)
- Legacy themes keep their `spec.md` and `shared/fixtures/` + `shared/expected/`; do not migrate them
- Never translate Python idioms literally — ask "how would a native X developer write this?"
- Docker for Go/Rust/Java; local for Python/TypeScript

## Available skills

Detailed operational procedures are organized into specialized skills:

- `@.claude/skills/theme-ops.md` — Theme layout, cases.json, one-PR workflow with per-language commits, README/Makefile conventions
- `@.claude/skills/dev-workflow.md` — GitHub PR creation workflow, branch and worktree management