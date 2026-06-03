# datetime-basic

## CLI Interface
```
datetime-basic --input-date <date>
```

## Input Format

- `--input-date`: `yyyy-mm-dd` 形式の日付文字列
- 例: `2024-01-15`, `2023-12-31`

## Output Format

### Valid Date (正しいフォーマットの場合)

```
Hi, I'm Dr. Calendar.
It's {datetime} now.
It has been {timestamp} since UNIX started.
You'd like to know {input-date}.
Thinking...
It's {days_diff}.
It was {weekday}.
We've been talking about for {elapsed} seconds.
I'm going to leave.
It's nice talking.
See you, again.
```

#### Placeholders

| Placeholder | Description | Format |
|-------------|-------------|--------|
| `{datetime}` | 処理開始時刻 | `%Y-%m-%d %H:%M:%S.%f` (マイクロ秒6桁) |
| `{timestamp}` | UNIX タイムスタンプ | 整数 |
| `{input-date}` | 入力された日付 | そのまま出力 |
| `{days_diff}` | 処理開始日との差分 | 下記参照 |
| `{weekday}` | 入力日の曜日 | `%A` (英語: Monday, Tuesday, ...) |
| `{elapsed}` | 経過時間 (秒) | `%S.%f` (マイクロ秒6桁) |

#### Days Difference Format

| Condition | Output |
|-----------|--------|
| 過去 | `It's N days ago.` |
| 当日 | `It's today.` |
| 未来 | `It's N days later.` |

### Invalid Date (不正フォーマットの場合)

```
Hi, I'm Dr. Calendar.
It's {datetime} now.
It has been {timestamp} since UNIX started.
Sorry, I don't know about {input-date}.
Bye!
```

## Processing Rules

1. 処理開始時刻を記録する
2. 開始時刻を `%Y-%m-%d %H:%M:%S.%f` フォーマットで出力
3. 開始時刻を UNIX タイムスタンプ (整数) に変換して出力
4. `--input-date` のパースを試みる
   - 失敗した場合: エラーメッセージを出力して終了
5. "Thinking..." を出力後、ランダムな時間スリープする
   - スリープ時間: 1,000〜3,000 ミリ秒
   - 乱数シード: 固定値を使用 (再現性のため)
6. 開始日と入力日の差分を日数で計算し、出力
7. 入力日の曜日を出力
8. 現在時刻と開始時刻の差分を秒単位で出力

## Language-Specific Notes

### Microseconds Precision

| Language | Precision | Note |
|----------|-----------|------|
| Python | 6桁 | `%f` で出力 |
| TypeScript | 3桁 | dayjs の制約 (ミリ秒まで) |
| Go | 6桁 | `time.Format` で対応 |
| Rust | 6桁 | chrono `%.6f` で対応 |

### Libraries

| Language | Library |
|----------|---------|
| Python | `datetime` (標準) |
| TypeScript | `dayjs` |
| Go | `time` (標準) |
| Rust | `chrono` |

### Random/Sleep

| Language | Random | Sleep |
|----------|--------|-------|
| Python | `random` | `time.sleep()` |
| TypeScript | `Math.random()` | `Bun.sleep()` |
| Go | `math/rand` | `time.Sleep()` |
| Rust | `rand` crate | `std::thread::sleep()` |

## Exit Codes

- `0`: 成功 (正常終了)
- `1`: エラー (不正な日付フォーマット)

## Example

### Valid Input

```bash
$ datetime-basic --input-date 2024-01-15
Hi, I'm Dr. Calendar.
It's 2024-06-01 10:30:45.123456 now.
It has been 1717238445 since UNIX started.
You'd like to know 2024-01-15.
Thinking...
It's 138 days ago.
It was Monday.
We've been talking about for 02.345678 seconds.
I'm going to leave.
It's nice talking.
See you, again.
```

### Invalid Input

```bash
$ datetime-basic --input-date invalid-date
Hi, I'm Dr. Calendar.
It's 2024-06-01 10:30:45.123456 now.
It has been 1717238445 since UNIX started.
Sorry, I don't know about invalid-date.
Bye!
```
