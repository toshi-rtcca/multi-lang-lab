# Theme Operations

## Theme layout

```
themes/{theme}/
├── README.md        # Task + Language Comparison
├── cases.json       # Shared test cases, read by every language's tests
├── Makefile
├── python/
├── typescript/
├── go/
└── rust/
```

- Implement the theme as a function (the API signature in the issue) plus tests.
- A CLI (`main`) is optional. Add one only when I/O itself is the learning point (e.g. subprocess, HTTP); keep it a thin wrapper.
- Tests must not depend on the external network. Start local servers or fakes inside the tests when needed.

### cases.json

A JSON array shared by all languages:

```json
[
  { "name": "basic", "input": "1 + 2", "expected": 3 }
]
```

Fields may be adapted per theme (e.g. `{ "name", "path", "expected_status" }`), but every language must read the same file.

## Theme README conventions

Each theme's `README.md` (`themes/{theme}/README.md`) should include:

- `## Task` — Description of the theme, including the API signature
- `## Language Comparison` — Comparison table of what each language teaches in this theme

This is the only place for comparison notes. Per-language READMEs are not required; add one only for non-obvious setup.

## Theme implementation workflow

One theme = one issue = one PR. Inside the PR, commit per language:

| Order | Commit | Content |
|-------|--------|---------|
| 1 | `docs({theme}): add README and cases` | README.md, cases.json, Makefile skeleton |
| 2 | `feat({theme}): add Python implementation` | Python reference implementation + tests |
| 3 | `feat({theme}): add TypeScript implementation` | |
| 4 | `feat({theme}): add Go implementation` | |
| 5 | `feat({theme}): add Rust implementation` | |

Flow: issue → plan (approved by the user) → commits above → single PR.

### Completion criteria

- Each language commit leaves its own `make {lang}-test` green
- The PR is complete when all languages' tests pass

Lint/format are recommended but not required.

## Makefile conventions

Standard targets per theme:

| Target | Description |
|--------|-------------|
| `{lang}-test` | Run tests (`py`, `ts`, `go`, `rs`) |
| `test` | Run all languages' tests |
| `{lang}-run` | Optional; only when the theme has a CLI |

## Tooling per language

| Language   | Package/Project Manager | Runtime       |
|------------|-------------------------|---------------|
| Python     | uv                      | python        |
| TypeScript | bun                     | bun           |
| Go         | go modules              | go (Docker)   |
| Rust       | cargo                   | cargo (Docker)|

## Legacy themes

Themes created before this workflow keep `spec.md`, `shared/fixtures/`, `shared/expected/`,
and per-language READMEs with status front matter. Do not migrate them.

## Issue templates

Use `.github/ISSUE_TEMPLATE/new-theme.md` for new themes. The issue's Handoff prompt is the starting point for the coding agent.
