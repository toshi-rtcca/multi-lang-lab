# Learning multiple languages with Coding Agents

Coding Agent を活用し、複数プログラミング言語を同時に学習する。

## Languages (対象言語)
- Python
- TypeScript
- Go
- Rust

## Policy (基本方針)
同じ題材を複数言語で実装し、設計思想を比較しながら学習することを目的とする。

言語の文法は実装に必要な範囲で都度調べる。

## Structure (構成)
```
multi-lang-lab/
  README.md              ← this file
  AGENTS.md              ← guidance for coding agents
  CLAUDE.md              ← sama as AGENTS.md
  .gitignore             ← for top-level 

  docs/
    learning-log.md
    language-comparison.md

  shared/
    fixtures/
      sample.txt         ← for word-count
      sales.csv
    expected/
      word-count.json
      sales-summary.json

  themes/
    word-count/       ←
      README.md
      Makefile
      spec.md
      python/
      typescript/
      go/
      rust/
      java/
    csv-summary/
```

## How to implement (学習の進め方)
1. **テーマ選定** - [Rosetta Code](https://rosettacode.org/wiki/Rosetta_Code) などから
2. **仕様記述** - テーマディレクトリの `spec.md` に記載する
3. **実装順** - Python -> TypeScript -> Go -> Rust
4. **実装後の学び** - `language-comparison.md` 記載の観点で各言語を比較する

