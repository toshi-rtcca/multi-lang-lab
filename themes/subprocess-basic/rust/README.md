---
language: rust
version: "1.87"
status: done
---

## Setup

The toolchain version is pinned in the repo-root `mise.toml`. Run `mise install` once.

## Run

```bash
cargo run -- --path ../../../shared/fixtures/subprocess-basic
```

## Test

```bash
cargo test
```
