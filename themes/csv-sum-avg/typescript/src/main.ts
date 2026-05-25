#!/usr/bin/env bun
/**
 * CLI entry point for csv_sum_avg.
 */

import { processCsv, CsvProcessingError } from "./processor";

/**
 * Parse CLI arguments.
 * Supports both --arg=value and --arg value formats.
 */
function parseArgs(args: string[]): { inputCsv: string | null; outputCsv: string | null } {
  let inputCsv: string | null = null;
  let outputCsv: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--input-csv=")) {
      inputCsv = arg.slice(12);
    } else if (arg === "--input-csv" && i + 1 < args.length) {
      inputCsv = args[++i];
    } else if (arg.startsWith("--output-csv=")) {
      outputCsv = arg.slice(13);
    } else if (arg === "--output-csv" && i + 1 < args.length) {
      outputCsv = args[++i];
    }
  }

  return { inputCsv, outputCsv };
}

async function main(): Promise<void> {
  const { inputCsv, outputCsv } = parseArgs(Bun.argv.slice(2));

  if (!inputCsv || !outputCsv) {
    console.error("Usage: csv_sum_avg --input-csv <path> --output-csv <path>");
    process.exit(1);
  }

  try {
    await processCsv(inputCsv, outputCsv);
  } catch (error) {
    if (error instanceof CsvProcessingError) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

if (import.meta.main) {
  main();
}

export { parseArgs };
