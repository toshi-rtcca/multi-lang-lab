import { describe, expect, test, spyOn } from "bun:test";
import { main } from "../src/main";

describe("main", () => {
  test("prints Hello, world!", () => {
    const consoleSpy = spyOn(console, "log");
    main();
    expect(consoleSpy).toHaveBeenCalledWith("Hello, world!");
    consoleSpy.mockRestore();
  });
});
