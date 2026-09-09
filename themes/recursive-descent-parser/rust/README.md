---
language: rust
version: "docker"
status: done
---

## Setup

```bash
docker build -t recursive-descent-parser-rust .
```

## Run

```bash
docker run --rm recursive-descent-parser-rust "1 + 2 * (3 - 4)"
```

## Test

```bash
docker run --rm --entrypoint cargo recursive-descent-parser-rust test
```
