---
language: rust
version: "1.87"
status: done
---

# word-count (Rust)

UTF-8 テキストファイルの行数、単語数、文字数をカウントし、最頻出単語を JSON 形式で出力する。

## Usage

```bash
word_count --input <file_path>
```

## Run

```bash
cargo run -- --input ../../../shared/fixtures/word-count.txt
```

## Test

```bash
cargo test
```
