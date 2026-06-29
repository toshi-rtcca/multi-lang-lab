# Theme Operations

## Theme README conventions

各テーマの `README.md` (`themes/{theme}/README.md`) には以下を含める:

- `## Task` — テーマの説明
- `## Language Comparison` — 各言語の実装比較表

Language Comparison では、そのテーマで学べる言語間の違いを表形式でまとめる。

## Theme implementation workflow

新テーマを追加する際は、以下の3ステップで実装し、各ステップごとにPRを作成する。

| Step | 内容 | PR type |
|------|------|---------|
| 1 | spec.md + README.md + shared fixtures/expected | docs |
| 2 | Python 実装 + test (reference) | feat |
| 3 | TypeScript / Go / Rust 実装 + test | feat |

各PRは前のPRがマージされてから作成する。

### Step completion criteria

各 Step の完了条件:

#### Step 1 (docs)
- `themes/{theme}/spec.md` 作成
- `themes/{theme}/README.md` 作成
- `shared/fixtures/{theme}/` にテストデータ配置
- `shared/expected/{theme}/` に期待出力配置

#### Step 2 & 3 (feat)
- CLI 実行が仕様通り動作する
- テストが全て通る
- `make {lang}-run` および `make {lang}-test` が成功する
- lint・フォーマットチェックをパスする

## Makefile conventions

各テーマの `Makefile` は以下のターゲットを標準とする:

| Target | 説明 |
|--------|------|
| `{lang}-run` | CLI を実行（例: `python-run`, `go-run`） |
| `{lang}-test` | テストを実行 |

## Tooling per language

| Language   | Package/Project Manager | Runtime       |
|------------|-------------------------|---------------|
| Python     | uv                      | python        |
| TypeScript | bun                     | bun           |
| Go         | go modules              | go (Docker)   |
| Rust       | cargo                   | cargo (Docker)|

## Implementation status

各言語実装のステータスは `themes/{theme}/{language}/README.md` の front matter で管理する。

### Front matter schema

| Field    | Values                       | Required |
|----------|------------------------------|----------|
| language | python, typescript, go, rust | yes      |
| version  | runtime version string       | yes      |
| status   | done, wip, not-started       | yes      |

TypeScript の `version` は bun のバージョンを記録する。

### README content

各言語の `README.md` には front matter に加えて、必要に応じて以下を記載:

- セットアップ手順
- CLI 実行例

### Status の収集

```bash
find themes -path "*/python/README.md" -o -path "*/typescript/README.md" -o -path "*/go/README.md" -o -path "*/rust/README.md"
```

## Issue templates

新規テーマ用のイシューは `.github/ISSUE_TEMPLATE/new-theme.md` を使用する。
