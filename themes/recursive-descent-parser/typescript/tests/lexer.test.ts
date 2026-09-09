import { describe, expect, test } from "bun:test";

import { LexError, tokenize } from "../src/lexer";

describe("tokenize", () => {
  test("a bare number tokenizes to NUMBER then EOF", () => {
    const tokens = tokenize("42");
    expect(tokens.map((t) => t.type)).toEqual(["NUMBER", "EOF"]);
    expect(tokens[0].text).toBe("42");
  });

  test("every operator and parenthesis maps to its own token type", () => {
    const tokens = tokenize("1+2-3*4/5(6)");
    expect(tokens.map((t) => t.type)).toEqual([
      "NUMBER",
      "PLUS",
      "NUMBER",
      "MINUS",
      "NUMBER",
      "STAR",
      "NUMBER",
      "SLASH",
      "NUMBER",
      "LPAREN",
      "NUMBER",
      "RPAREN",
      "EOF",
    ]);
  });

  test("whitespace between tokens is discarded", () => {
    const tokens = tokenize("  1 +  2\t*3\n");
    expect(tokens.map((t) => t.type)).toEqual(["NUMBER", "PLUS", "NUMBER", "STAR", "NUMBER", "EOF"]);
  });

  test("empty (or all-whitespace) input tokenizes to just EOF", () => {
    expect(tokenize("   ").map((t) => t.type)).toEqual(["EOF"]);
  });

  test("an unrecognized character is a lex error", () => {
    expect(() => tokenize("1 + a")).toThrow(LexError);
  });
});
