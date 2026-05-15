# 01 Word count

## CLI Interface
```
word_count --input <file_path>
```

## Input

- UTF-8 text file path

## Output (JSON format)
```json
{
  "lines": 42,
  "words": 1234,
  "characters": 5678,
  "most_common_words": [
    {"word": "the", "count": 100},
    ...
  ]
}
```

## Counting Rules

### lines
- 改行文字 (`\n`) の数をカウント
- 末尾に改行がないファイルは +1 する
- 例: `"a\nb"` → 2行、`"a\nb\n"` → 2行、`""` → 0行

### words
- 正規表現 `[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*` にマッチする文字列をカウント
- 英数字の連続、またはハイフンで繋がった英数字の連続
- 大文字小文字を区別しない（カウント時は小文字に正規化）
- 例: `"Hello"`, `"self-aware"`, `"COVID-19"` は各1語

### characters
- Unicode 文字数（バイト数ではない）
- 改行文字も1文字としてカウント
- 例: `"Hello\n"` → 6文字

### most_common_words
- 上位10語を頻度降順で返す
- 各要素は `{"word": string, "count": number}` の形式
- 同一頻度の場合の順序は実装依存

## Edge Cases
- Empty file → `lines: 0`, `words: 0`, `characters: 0`, `most_common_words: []`
