---
language: go
version: "docker"
status: done
---

## Setup

```bash
docker build -t n-queens-go .
```

## Run

```bash
docker run --rm n-queens-go --n 8
```

## Test

```bash
docker run --rm --entrypoint go n-queens-go test -v
```
