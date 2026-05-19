import { describe, test, expect } from "bun:test";
import { countWords } from "../src/counter";
import { parseArgs } from "../src/main";

describe("countWords", () => {
  test("basic word counting", () => {
    const text = "Hello world\nHello Python\n";
    const result = countWords(text);

    expect(result.lines).toBe(2);
    expect(result.words).toBe(4);
    expect(result.characters).toBe(25);
    expect(result.most_common_words.length).toBe(3);
    expect(result.most_common_words[0]).toEqual({ word: "hello", count: 2 });
  });

  test("empty file handling", () => {
    const result = countWords("");

    expect(result.lines).toBe(0);
    expect(result.words).toBe(0);
    expect(result.characters).toBe(0);
    expect(result.most_common_words).toEqual([]);
  });

  test("case insensitivity", () => {
    const text = "The THE the tHe";
    const result = countWords(text);

    expect(result.words).toBe(4);
    expect(result.most_common_words[0]).toEqual({ word: "the", count: 4 });
  });

  test("hyphenated words are treated as single words", () => {
    const text = "self-aware self-aware non-trivial";
    const result = countWords(text);

    expect(result.words).toBe(3);
    expect(result.most_common_words[0]).toEqual({ word: "self-aware", count: 2 });
  });

  test("file without trailing newline", () => {
    const text = "one\ntwo\nthree";
    const result = countWords(text);

    expect(result.lines).toBe(3);
  });

  test("top_n parameter", () => {
    const text = "a a a b b c d e f g h i j k";
    const result = countWords(text, 3);

    expect(result.most_common_words.length).toBe(3);
    expect(result.most_common_words[0].word).toBe("a");
    expect(result.most_common_words[1].word).toBe("b");
  });

  test("unicode character count", () => {
    // Japanese characters: each is 1 character (not 3 bytes)
    const text = "こんにちは";
    const result = countWords(text);

    expect(result.characters).toBe(5);
  });
});

describe("parseArgs", () => {
  test("parses --input=value format", () => {
    expect(parseArgs(["--input=file.txt"])).toBe("file.txt");
  });

  test("parses --input value format", () => {
    expect(parseArgs(["--input", "file.txt"])).toBe("file.txt");
  });

  test("returns null when --input is not provided", () => {
    expect(parseArgs([])).toBe(null);
  });

  test("returns null when --input has no value", () => {
    expect(parseArgs(["--input"])).toBe(null);
  });
});
