# Learning Multiple Languages with Coding Agents

Use coding agents to learn multiple programming languages simultaneously.

## For Coding Agents
- See [AGENTS.md](AGENTS.md) for agent context and conventions
- See [.claude/skills/](.claude/skills/) for operational procedures

## Languages
- Python
- TypeScript
- Go
- Rust

## Policy
The purpose is to learn through implementing the same topic in multiple languages and comparing their design philosophies.

Language syntax is looked up as needed during implementation.

## Structure
```
multi-lang-lab/
  README.md              ← this file
  AGENTS.md              ← guidance for coding agents
  CLAUDE.md              ← same as AGENTS.md

  sketches/
    {yyyymmdd}-{topic}/  ← quick single-language experiments

  themes/
    {theme}/
      README.md          ← task + language comparison table
      cases.json         ← shared test cases (source of truth with the issue)
      Makefile
      {language}/        ← implementation + tests

  docs/, shared/         ← used by legacy themes only
```

## How to Implement
1. **Sketch** - explore the idea in Python or Rust under `sketches/`
2. **Open a theme issue** - Goal, comparison points, API signature, cases, and a handoff prompt
3. **Implement in one PR** - one commit per language: Python → TypeScript → Go → Rust
4. **Compare** - fill in the Language Comparison table in the theme README
