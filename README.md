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
  .gitignore

  docs/
    learning-log.md
    language-comparison.md

  shared/
    fixtures/            ← shared test input files
    expected/            ← shared expected output files

  themes/
    {theme}/
      README.md          ← task description
      spec.md            ← implementation spec (source of truth)
      Makefile
      language-comparison.md
      {language}/
        README.md        ← front matter: language, version, status
        ...              ← implementation files
```

## How to Implement
1. **Choose a theme** - from [Rosetta Code](https://rosettacode.org/wiki/Rosetta_Code) or similar sources
2. **Write specification** - document in `spec.md` of the theme directory
3. **Implementation order** - Python → TypeScript → Go → Rust
4. **Post-implementation learning** - compare languages based on perspectives in `language-comparison.md`
