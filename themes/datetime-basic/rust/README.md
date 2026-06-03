---
language: rust
version: "1.87"
status: done
---

## Setup

```bash
docker build -t datetime-basic-rust .
```

## Run

```bash
docker run --rm datetime-basic-rust --input-date 2024-01-15
```

## Test

```bash
docker run --rm --entrypoint cargo datetime-basic-rust test
```
