# Theme Operations

## Theme README conventions

Each theme's `README.md` (`themes/{theme}/README.md`) should include:

- `## Task` — Description of the theme
- `## Language Comparison` — Implementation comparison table for each language

In Language Comparison, summarize language-specific differences that can be learned from this theme in table format.

## Theme implementation workflow

When adding a new theme, implement it in 3 steps and create a PR for each step.

| Step | Content | PR type |
|------|---------|---------|
| 1 | spec.md + README.md + shared fixtures/expected | docs |
| 2 | Python implementation + test (reference) | feat |
| 3 | TypeScript / Go / Rust implementation + test | feat |

Create each PR after the previous PR is merged.

### Step completion criteria

Completion criteria for each Step:

#### Step 1 (docs)
- Create `themes/{theme}/spec.md`
- Create `themes/{theme}/README.md`
- Place test data in `shared/fixtures/{theme}/`
- Place expected output in `shared/expected/{theme}/`

#### Step 2 & 3 (feat)
- CLI execution works according to specification
- All tests pass
- `make {lang}-run` and `make {lang}-test` succeed
- Pass lint and format checks

## Makefile conventions

Each theme's `Makefile` should have the following standard targets:

| Target | Description |
|--------|-------------|
| `{lang}-run` | Run the CLI (e.g., `python-run`, `go-run`) |
| `{lang}-test` | Run tests |

## Tooling per language

| Language   | Package/Project Manager | Runtime       |
|------------|-------------------------|---------------|
| Python     | uv                      | python        |
| TypeScript | bun                     | bun           |
| Go         | go modules              | go (Docker)   |
| Rust       | cargo                   | cargo (Docker)|

## Implementation status

The status of each language implementation is managed in the front matter of `themes/{theme}/{language}/README.md`.

### Front matter schema

| Field    | Values                       | Required |
|----------|------------------------------|----------|
| language | python, typescript, go, rust | yes      |
| version  | runtime version string       | yes      |
| status   | done, wip, not-started       | yes      |

For TypeScript, the `version` field records the bun version.

### README content

Each language's `README.md` should include the front matter and, if necessary:

- Setup instructions
- CLI execution examples

### Collecting status

```bash
find themes -path "*/python/README.md" -o -path "*/typescript/README.md" -o -path "*/go/README.md" -o -path "*/rust/README.md"
```

## Issue templates

Use `.github/ISSUE_TEMPLATE/new-theme.md` for issues about new themes.
