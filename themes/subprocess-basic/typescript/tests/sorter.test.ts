import { describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join, resolve } from "path";

import { parseArgs } from "../src/main";
import {
  formatEntries,
  parseLsOutput,
  sortEntries,
  sortLsL,
  SortLsError,
  type FileEntry,
  type LsRunner,
} from "../src/sorter";

describe("parseLsOutput", () => {
  test("extracts regular files only", () => {
    const output = `total 16
drwxr-xr-x  2 user  group  64 Jan  1 00:00 nested
-rw-r--r--  1 user  group  20 Jan  1 00:00 bravo.txt
lrwxr-xr-x  1 user  group   9 Jan  1 00:00 link.txt -> bravo.txt
-rw-r--r--@ 1 user  group  10 Jan  1 00:00 alpha name.txt
`;

    expect(parseLsOutput(output)).toEqual([
      { size: 20, filename: "bravo.txt" },
      { size: 10, filename: "alpha name.txt" },
    ]);
  });
});

describe("sortEntries", () => {
  test("sorts by size descending then filename ascending", () => {
    const entries: FileEntry[] = [
      { size: 10, filename: "charlie.txt" },
      { size: 20, filename: "bravo.txt" },
      { size: 20, filename: "alpha.txt" },
    ];

    expect(sortEntries(entries)).toEqual([
      { size: 20, filename: "alpha.txt" },
      { size: 20, filename: "bravo.txt" },
      { size: 10, filename: "charlie.txt" },
    ]);
  });
});

describe("formatEntries", () => {
  test("includes header and trailing newline", () => {
    expect(formatEntries([{ size: 20, filename: "bravo.txt" }])).toBe(
      "size   filename\n20   bravo.txt\n"
    );
  });

  test("formats empty results as header-only output", () => {
    expect(formatEntries([])).toBe("size   filename\n");
  });
});

describe("sortLsL", () => {
  test("matches the shared expected fixture", async () => {
    const repoRoot = resolve(import.meta.dir, "../../../..");
    const fixtureDir = join(repoRoot, "shared/fixtures/subprocess-basic");
    const expected = await readFile(
      join(repoRoot, "shared/expected/subprocess-basic.txt"),
      "utf-8"
    );

    expect(await sortLsL(fixtureDir)).toBe(expected);
  });

  test("rejects missing path", async () => {
    const missingPath = join(tmpdir(), "subprocess-basic-missing-path");

    await expect(sortLsL(missingPath)).rejects.toThrow(SortLsError);
  });

  test("rejects non-directory path", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "subprocess-basic-"));
    const filePath = join(tempDir, "file.txt");

    try {
      await writeFile(filePath, "content", "utf-8");
      await expect(sortLsL(filePath)).rejects.toThrow("Path is not a directory");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("handles empty directory output with a mocked runner", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "subprocess-basic-"));
    const runner: LsRunner = () => ({ exitCode: 0, stdout: "total 0\n", stderr: "" });

    try {
      expect(await sortLsL(tempDir, runner)).toBe("size   filename\n");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("raises an error when the subprocess fails", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "subprocess-basic-"));
    const runner: LsRunner = () => ({ exitCode: 1, stdout: "", stderr: "ls failed" });

    try {
      await expect(sortLsL(tempDir, runner)).rejects.toThrow("ls failed");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});

describe("parseArgs", () => {
  test("parses --path=value", () => {
    expect(parseArgs(["--path=fixtures"])).toEqual({ path: "fixtures" });
  });

  test("parses --path value", () => {
    expect(parseArgs(["--path", "fixtures"])).toEqual({ path: "fixtures" });
  });

  test("returns null when path is missing", () => {
    expect(parseArgs([])).toEqual({ path: null });
  });
});
