# csv-sum-avg

## CLI Interface
```
csv-sum-avg --input-csv <path> --output-csv <path>
```

## Input Format

- 1行目: ヘッダー（最初の列は文字列、2列目以降は数値列名）
- 2行目以降: データ（最初の列は文字列、2列目以降は数値）
- 区切り: カンマ (`,`)
- エンコーディング: UTF-8

### Example Input
```csv
name,math,science,english
Alice,85,90,78
Bob,72,88,95
```

## Output Format

- 元の列 + `SUM` 列 + `AVG` 列
- `SUM`: 各行の数値列の合計
- `AVG`: 各行の数値列の平均（小数点以下2桁、四捨五入）
- 出力先: `--output-csv` で指定したファイル

### Example Output
```csv
name,math,science,english,SUM,AVG
Alice,85,90,78,253,84.33
Bob,72,88,95,255,85.00
```

## Processing Rules

1. `--input-csv` で指定されたファイルを読み込む
2. ヘッダー行に `SUM` と `AVG` 列を追加
3. 各データ行について:
   - 2列目以降の数値を合計して `SUM` に記録
   - 2列目以降の数値の平均を計算し、小数点以下2桁に丸めて `AVG` に記録
4. 結果を `--output-csv` で指定されたファイルに出力

## Edge Cases

- **空のCSVファイル (0バイト)**: エラーとして終了コード1で終了。stderr にエラーメッセージを出力
- **ヘッダーのみのCSV (1行)**: ヘッダー行のみ (`SUM`, `AVG` 列付き) を出力
- **数値以外の値が数値列に含まれる場合**: エラーとして終了コード1で終了。stderr にエラーメッセージを出力
- **ファイルが存在しない場合**: エラーとして終了コード1で終了

## Exit Codes

- `0`: 成功
- `1`: エラー（空ファイル、不正なデータ、ファイル未検出など）
