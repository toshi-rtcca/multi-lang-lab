# multi-lang-lab — Coding Agent Context

## Project purpose
Comparative multi-language implementation of identical CLI specs.
Python = reference implementation. Other languages = idiomatic reimplementation.

## Key conventions
- Each theme has spec.md — this is the source of truth, not the Python code
- Shared fixtures in shared/fixtures/, expected outputs in shared/expected/
- Never translate Python idioms literally — ask "how would a native X developer write this?"
- Docker for Go/Rust/Java; local for Python/TypeScript

## Theme README conventions

各テーマの `README.md` (`themes/{theme}/README.md`) には以下を含める:

- `## Task` — テーマの説明
- `## Language Comparison` — 各言語の実装比較表

Language Comparison では、そのテーマで学べる言語間の違いを表形式でまとめる。

## Theme implementation workflow

新テーマを追加する際は、以下の3ステップで実装し、各ステップごとにPRを作成する。

| Step | 内容 | PR type |
|------|------|---------|
| 1 | spec.md + README.md | docs |
| 2 | Python 実装 + test (reference) | feat |
| 3 | TypeScript / Go / Rust 実装 + test | feat |

各PRは前のPRがマージされてから作成する。

## Tooling per language

| Language   | Package/Project Manager | Runtime       |
|------------|-------------------------|---------------|
| Python     | uv                      | python        |
| TypeScript | bun                     | bun           |
| Go         | go modules              | go (Docker)   |
| Rust       | cargo                   | cargo (Docker)|

## Implementation status

各言語実装のステータスは `themes/{theme}/{language}/README.md` の front matter で管理する。

### Front matter schema

| Field    | Values                       | Required |
|----------|------------------------------|----------|
| language | python, typescript, go, rust | yes      |
| version  | runtime version string       | yes      |
| status   | done, wip, not-started       | yes      |

TypeScript の `version` は bun のバージョンを記録する。

### Status の収集

```bash
find themes -path "*/python/README.md" -o -path "*/typescript/README.md" -o -path "*/go/README.md" -o -path "*/rust/README.md"
```

## GitHub operations

- When working with GitHub issues or pull requests, use the `gh` command.
- When creating a pull request, always use the local template via `--body-file`:
  ```
  gh pr create --title "<type>: <summary>" --body-file .github/pull_request_template.md
  ```
- Allowed `<type>` values: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Do not create a PR with an ad-hoc body unless the user explicitly asks for it.

## Branch and worktree

When editing the repository, create a branch (and optionally a worktree) to avoid modifying `main` directly.

### Naming conventions

| Item          | Pattern                              | Example                            |
|---------------|--------------------------------------|------------------------------------|
| task name     | `{issue-number}-{short-description}` | `42-add-rust-wordcount`            |
| branch name   | `claude/{task-name}`                 | `claude/42-add-rust-wordcount`     |
| worktree path | `.worktrees/{task-name}`             | `.worktrees/42-add-rust-wordcount` |

### For tasks without an issue

Use `adhoc-{description}` as task name (e.g., `adhoc-fix-typo`).

### When to use worktrees

Worktrees are optional but recommended when:
- Working on multiple tasks in parallel
- The task involves significant changes

For small, single-task work, a simple branch is sufficient.

### Cleanup

After a PR is merged, remove the worktree and branch:
```
git worktree remove .worktrees/{task-name}
git branch -d claude/{task-name}
```