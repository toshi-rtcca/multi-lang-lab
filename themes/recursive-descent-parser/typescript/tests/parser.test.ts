import { describe, expect, test } from "bun:test";

import { tokenize } from "../src/lexer";
import { EvalError, ParseError, parse, parseAndEvaluate } from "../src/parser";

describe("parseAndEvaluate", () => {
  test("a bare number evaluates to itself", () => {
    expect(parseAndEvaluate("42")).toBe(42);
  });

  test("multiplication binds tighter than addition", () => {
    expect(parseAndEvaluate("1 + 2 * 3")).toBe(7);
  });

  test("subtraction is left-associative", () => {
    expect(parseAndEvaluate("10 - 2 - 3")).toBe(5);
  });

  test("division is left-associative", () => {
    expect(parseAndEvaluate("20 / 2 / 5")).toBe(2);
  });

  test("nested parentheses override default precedence", () => {
    expect(parseAndEvaluate("(1 + (2 + 3) * (4 - 1))")).toBe(16);
  });

  test("whitespace-insensitive input", () => {
    expect(parseAndEvaluate("  1 +2*3")).toBe(7);
  });

  test("the theme's own README example", () => {
    expect(parseAndEvaluate("1 + 2 * (3 - 4)")).toBe(-1);
  });

  test("division truncates toward zero, not floor", () => {
    expect(parseAndEvaluate("(1 - 4) / 2")).toBe(-1);
  });

  test("division by zero is an evaluation-time error", () => {
    expect(() => parseAndEvaluate("1 / 0")).toThrow(EvalError);
  });

  test.each(["(1 + 2", "1 + 2)", "", "1 + * 2"])(
    "malformed input '%s' raises a parse error",
    (expression) => {
      expect(() => parseAndEvaluate(expression)).toThrow(ParseError);
    },
  );

  test("1 + 2 parses to a BinaryOp of two Number leaves", () => {
    const ast = parse(tokenize("1 + 2"));
    expect(ast).toEqual({
      kind: "BinaryOp",
      op: "+",
      left: { kind: "Number", value: 1 },
      right: { kind: "Number", value: 2 },
    });
  });
});
