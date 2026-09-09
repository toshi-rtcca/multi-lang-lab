#!/usr/bin/env bun
/**
 * CLI entry point for recursive-descent-parser.
 */

import { EvalError, ParseError, parseAndEvaluate } from "./parser";
import { LexError } from "./lexer";

function main(): void {
  const expression = Bun.argv[2] ?? "";

  try {
    const result = parseAndEvaluate(expression);
    console.log(result);
  } catch (error) {
    if (error instanceof LexError || error instanceof ParseError || error instanceof EvalError) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}

if (import.meta.main) {
  main();
}
