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
uv run recursive-descent-parser "1 + 2 * (3 - 4)"
```

## Test

```bash
uv run pytest
```
