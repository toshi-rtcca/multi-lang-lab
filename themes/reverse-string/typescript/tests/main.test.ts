import { describe, expect, test } from "bun:test";
import { reverseGraphemes } from "../src/main";

describe("reverseGraphemes", () => {
  test("ASCII string", () => {
    expect(reverseGraphemes("asdf")).toBe("fdsa");
  });

  test("combining characters", () => {
    // s with combining enclosing circle, f with combining overline
    expect(reverseGraphemes("as⃝df̅")).toBe("f̅ds⃝a");
  });

  test("Japanese", () => {
    expect(reverseGraphemes("ようこそ,世界に!")).toBe("!に界世,そこうよ");
  });

  test("ZWJ emoji", () => {
    // Family emoji (ZWJ sequence) should stay as single cluster
    expect(reverseGraphemes("👨‍👩‍👧‍👦")).toBe("👨‍👩‍👧‍👦");
  });

  test("empty string", () => {
    expect(reverseGraphemes("")).toBe("");
  });

  test("single character", () => {
    expect(reverseGraphemes("a")).toBe("a");
  });

  test("emoji sequence", () => {
    expect(reverseGraphemes("🍎🍊🍋")).toBe("🍋🍊🍎");
  });
});
