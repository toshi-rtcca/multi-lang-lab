#!/usr/bin/env bun
/**
 * CLI entry point for word_count.
 */

import { countWords } from "./counter";

/**
 * Parse --input argument from CLI args.
 * Supports both --input=value and --input value formats.
 */
function parseArgs(args: string[]): string | null {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--input=")) {
      return arg.slice(8);
    }
    if (arg === "--input" && i + 1 < args.length) {
      return args[i + 1];
    }
  }
  return null;
}

async function main(): Promise<void> {
  const inputPath = parseArgs(Bun.argv.slice(2));

  if (!inputPath) {
    console.error("Usage: word_count --input <file_path>");
    process.exit(1);
  }

  const file = Bun.file(inputPath);
  const text = await file.text();
  const result = countWords(text);

  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.main) {
  main();
}

export { parseArgs };
