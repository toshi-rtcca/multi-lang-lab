---
language: go
version: "1.24"
status: done
---

## Setup

```bash
docker build -t datetime-basic-go .
```

## Run

```bash
docker run --rm datetime-basic-go --input-date 2024-01-15
```

## Test

```bash
docker run --rm --entrypoint go datetime-basic-go test -v
```
