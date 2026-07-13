---
language: rust
version: "docker"
status: done
---

## Setup

```bash
docker build -t subprocess-basic-rust .
```

## Run

```bash
docker run --rm -v $(pwd)/../../../shared:/shared subprocess-basic-rust --path /shared/fixtures/subprocess-basic
```

## Test

```bash
docker run --rm --entrypoint cargo subprocess-basic-rust test
```
