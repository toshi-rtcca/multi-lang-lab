# multi-lang-lab — Coding Agent Context

## Project purpose
Comparative multi-language implementation of identical CLI specs.
Python = reference implementation. Other languages = idiomatic reimplementation.

## Learning Focus
This project is for comparative multi-language learning.
CLI implementations prioritize clarity of learning points over production efficiency or optimization.

## Documentation Language Policy
- All documentation files (.md) must be written in English
- All code comments must be written in English
- User instructions/prompts to coding agents may be in Japanese

## Key conventions
- Each theme has spec.md — this is the source of truth, not the Python code
- Shared fixtures in shared/fixtures/, expected outputs in shared/expected/
- Never translate Python idioms literally — ask "how would a native X developer write this?"
- Docker for Go/Rust/Java; local for Python/TypeScript

## Available skills

Detailed operational procedures are organized into specialized skills:

- `@.claude/skills/theme-ops.md` — Theme implementation workflow, README/Makefile conventions, status management, issue templates
- `@.claude/skills/dev-workflow.md` — GitHub PR creation workflow, branch and worktree management