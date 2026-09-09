---
language: go
version: "docker"
status: done
---

## Setup

```bash
docker build -t recursive-descent-parser-go .
```

## Run

```bash
docker run --rm recursive-descent-parser-go "1 + 2 * (3 - 4)"
```

## Test

```bash
docker run --rm --entrypoint go recursive-descent-parser-go test -v
```
