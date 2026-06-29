# Development Workflow

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
