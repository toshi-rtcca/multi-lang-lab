#!/usr/bin/env bun
/**
 * CLI entry point for n-queens.
 */

import { formatSolutions, NQueensError, solve } from "./solver";

export function parseArgs(args: string[]): { n: string } {
  let n = "8";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--n=")) {
      n = arg.slice(4);
    } else if (arg === "--n" && i + 1 < args.length) {
      n = args[++i];
    }
  }

  return { n };
}

function main(): void {
  const { n } = parseArgs(Bun.argv.slice(2));
  const parsedN = Number(n);

  if (!Number.isInteger(parsedN)) {
    console.error(`Invalid value for --n: ${n}`);
    process.exit(1);
  }

  try {
    const solutions = solve(parsedN);
    process.stdout.write(formatSolutions(solutions));
  } catch (error) {
    if (error instanceof NQueensError) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
}

if (import.meta.main) {
  main();
}
