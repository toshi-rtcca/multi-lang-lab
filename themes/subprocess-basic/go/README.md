---
language: go
version: "docker"
status: done
---

## Setup

```bash
docker build -t subprocess-basic-go .
```

## Run

```bash
docker run --rm -v $(pwd)/../../../shared:/shared subprocess-basic-go --path /shared/fixtures/subprocess-basic
```

## Test

```bash
docker run --rm --entrypoint go subprocess-basic-go test -v
```
