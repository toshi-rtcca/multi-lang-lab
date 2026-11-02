---
language: go
version: "1.24"
status: done
---

## Setup

The toolchain version is pinned in the repo-root `mise.toml`. Run `mise install` once.

## Run

```bash
go run . --n 8
```

## Test

```bash
go test -v ./...
```
