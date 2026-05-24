---
language: rust
version: "1.87"
status: done
---

# reverse-string (Rust)

Reverse a string at the grapheme cluster level using `unicode-segmentation`.

## Run (Docker)

```bash
docker build -t reverse-string-rust .
docker run --rm reverse-string-rust "asdf"
```

## Test (Docker)

```bash
docker build -t reverse-string-rust .
docker run --rm reverse-string-rust cargo test
```
