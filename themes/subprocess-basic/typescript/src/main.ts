#!/usr/bin/env bun
/**
 * CLI entry point for sort-ls-l.
 */

import { sortLsL, SortLsError } from "./sorter";

export function parseArgs(args: string[]): { path: string | null } {
  let path: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--path=")) {
      path = arg.slice(7);
    } else if (arg === "--path" && i + 1 < args.length) {
      path = args[++i];
    }
  }

  return { path };
}

async function main(): Promise<void> {
  const { path } = parseArgs(Bun.argv.slice(2));

  if (!path) {
    console.error("Usage: sort-ls-l --path <path-to-directory>");
    process.exit(1);
  }

  try {
    const output = await sortLsL(path);
    process.stdout.write(output);
  } catch (error) {
    if (error instanceof SortLsError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
}

if (import.meta.main) {
  main();
}
