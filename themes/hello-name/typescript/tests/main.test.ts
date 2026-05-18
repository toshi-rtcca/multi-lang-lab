import { describe, expect, test, spyOn } from "bun:test";
import { parseArgs } from "../src/main";

describe("parseArgs", () => {
  test("returns name when --name is provided", () => {
    expect(parseArgs(["--name=World"])).toBe("World");
  });

  test("returns null when --name is not provided", () => {
    expect(parseArgs([])).toBe(null);
  });

  test("handles name with spaces", () => {
    expect(parseArgs(["--name=John Doe"])).toBe("John Doe");
  });
});
