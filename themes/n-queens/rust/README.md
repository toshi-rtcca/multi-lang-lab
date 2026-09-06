---
language: rust
version: "docker"
status: done
---

## Setup

```bash
docker build -t n-queens-rust .
```

## Run

```bash
docker run --rm n-queens-rust --n 8
```

## Test

```bash
docker run --rm --entrypoint cargo n-queens-rust test
```
