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

## Setup
Language toolchains (Python, Bun, Go, Rust) are pinned in [`mise.toml`](mise.toml).

1. Install [mise](https://mise.jdx.dev/getting-started.html) and [uv](https://docs.astral.sh/uv/getting-started/installation/)
2. Install the pinned toolchains from the repo root:
   ```bash
   mise trust
   mise install
   ```
3. Run every language's tests in a theme (mise activates the toolchains when
   [shell activation](https://mise.jdx.dev/getting-started.html#activate-mise) is set up;
   otherwise prefix commands with `mise exec --`):
   ```bash
   cd themes/http-get
   make test
   ```

## Policy
The purpose is to learn through implementing the same topic in multiple languages and comparing their design philosophies.

Language syntax is looked up as needed during implementation.

## Structure
```
multi-lang-lab/
  README.md              ← this file
  AGENTS.md              ← guidance for coding agents
  CLAUDE.md              ← same as AGENTS.md
  mise.toml              ← pinned language toolchain versions

  sketches/
    {yyyymmdd}-{topic}/  ← quick single-language experiments

  themes/
    {theme}/
      README.md          ← task + language comparison table
      cases.json         ← shared test cases (source of truth with the issue)
      Makefile
      {language}/        ← implementation + tests

  docs/, shared/         ← legacy themes only; removed once all are migrated
```

## Themes

| Theme | Format | Summary |
|-------|--------|---------|
| [csv-sum-avg](themes/csv-sum-avg/) | legacy | Per-row SUM/AVG over a numeric CSV |
| [datetime-basic](themes/datetime-basic/) | legacy | Date parsing, diff, and formatting via an interactive CLI |
| [hello-name](themes/hello-name/) | legacy | Greet a name given as a CLI argument |
| [hello-world](themes/hello-world/) | legacy | Print "Hello, world!" |
| [http-get](themes/http-get/) | current | Synchronous HTTP GET returning the status code |
| [n-queens](themes/n-queens/) | legacy | Backtracking N-Queens solver |
| [recursive-descent-parser](themes/recursive-descent-parser/) | legacy | Parse and evaluate arithmetic expressions |
| [reverse-string](themes/reverse-string/) | legacy | Grapheme-aware Unicode string reversal |
| [subprocess-basic](themes/subprocess-basic/) | legacy | Run `ls -l` and reformat its output as a sorted table |
| [word-count](themes/word-count/) | legacy | Line/word/char counts and top-10 words |

Format: `current` themes have `cases.json`; `legacy` themes do not.
Legacy themes are migrated on revisit — see "Legacy themes" in [theme-ops](.claude/skills/theme-ops.md).

## How to Implement
1. **Sketch** - explore the idea in Python or Rust under `sketches/`
2. **Open a theme issue** - Goal, comparison points, API signature, cases, and a handoff prompt
3. **Implement in one PR** - one commit per language: Python → TypeScript → Go → Rust
4. **Compare** - fill in the Language Comparison table in the theme README
