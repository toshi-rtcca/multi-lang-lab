---
language: typescript
version: "1.3"
status: done
---

# word-count (TypeScript)

UTF-8 テキストファイルの行数、単語数、文字数をカウントし、最頻出単語を JSON 形式で出力する。

## Usage

```bash
bun run src/main.ts --input <file_path>
```

## Run

```bash
bun install
bun run src/main.ts --input ../../../shared/fixtures/word-count.txt
```

## Test

```bash
bun test
```
