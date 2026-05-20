---
language: go
version: "1.24"
status: done
---

# word-count (Go)

UTF-8 テキストファイルの行数、単語数、文字数をカウントし、最頻出単語を JSON 形式で出力する。

## Usage

```bash
word_count --input <file_path>
```

## Run (Docker)

```bash
docker build -t word-count-go .
docker run --rm -v $(pwd)/../../../shared:/shared word-count-go --input /shared/fixtures/word-count.txt
```

## Test (Docker)

```bash
docker build -t word-count-go .
docker run --rm word-count-go go test -v
```
