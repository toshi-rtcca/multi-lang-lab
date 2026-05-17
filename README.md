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
  CLAUDE.md              ← same as AGENTS.md
  .gitignore

  docs/
    learning-log.md
    language-comparison.md

  shared/
    fixtures/            ← shared test input files
    expected/            ← shared expected output files

  themes/
    {theme}/
      README.md          ← task description
      spec.md            ← implementation spec (source of truth)
      Makefile
      language-comparison.md
      {language}/
        README.md        ← front matter: language, version, status
        ...              ← implementation files
```

## How to implement (学習の進め方)
1. **テーマ選定** - [Rosetta Code](https://rosettacode.org/wiki/Rosetta_Code) などから
2. **仕様記述** - テーマディレクトリの `spec.md` に記載する
3. **実装順** - Python -> TypeScript -> Go -> Rust
4. **実装後の学び** - `language-comparison.md` 記載の観点で各言語を比較する

