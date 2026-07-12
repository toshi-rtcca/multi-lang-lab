---
language: python
version: "3.14"
status: done
---

## Setup

```bash
uv sync
```

## Run

```bash
uv run sort-ls-l --path ../../../shared/fixtures/subprocess-basic
```

## Test

```bash
uv run pytest
```
