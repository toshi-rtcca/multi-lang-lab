---
language: go
version: "1.24"
status: done
---

## Setup

The toolchain version is pinned in the repo-root `mise.toml`. Run `mise install` once.

## Run

```bash
go run . "1 + 2 * (3 - 4)"
```

## Test

```bash
go test -v ./...
```
