import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { processCsv, CsvProcessingError } from "../src/processor";
import { parseArgs } from "../src/main";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

describe("processCsv", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "csv-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  test("basic CSV processing", async () => {
    const inputPath = join(tempDir, "input.csv");
    const outputPath = join(tempDir, "output.csv");

    await Bun.write(inputPath, "name,a,b,c\nAlice,10,20,30\n");
    await processCsv(inputPath, outputPath);

    const result = await Bun.file(outputPath).text();
    const lines = result.trim().split("\n");

    expect(lines[0]).toBe("name,a,b,c,SUM,AVG");
    expect(lines[1]).toBe("Alice,10,20,30,60,20.00");
  });

  test("empty file throws error", async () => {
    const inputPath = join(tempDir, "input.csv");
    const outputPath = join(tempDir, "output.csv");

    await Bun.write(inputPath, "");

    expect(processCsv(inputPath, outputPath)).rejects.toThrow(CsvProcessingError);
  });

  test("header-only file produces header-only output", async () => {
    const inputPath = join(tempDir, "input.csv");
    const outputPath = join(tempDir, "output.csv");

    await Bun.write(inputPath, "name,a,b,c\n");
    await processCsv(inputPath, outputPath);

    const result = await Bun.file(outputPath).text();
    const lines = result.trim().split("\n");

    expect(lines.length).toBe(1);
    expect(lines[0]).toBe("name,a,b,c,SUM,AVG");
  });

  test("non-numeric value throws error", async () => {
    const inputPath = join(tempDir, "input.csv");
    const outputPath = join(tempDir, "output.csv");

    await Bun.write(inputPath, "name,a,b\nAlice,10,abc\n");

    expect(processCsv(inputPath, outputPath)).rejects.toThrow("Non-numeric");
  });

  test("AVG is rounded to 2 decimal places", async () => {
    const inputPath = join(tempDir, "input.csv");
    const outputPath = join(tempDir, "output.csv");

    // 85 + 90 + 78 = 253, AVG = 84.333... -> 84.33
    await Bun.write(inputPath, "name,a,b,c\nAlice,85,90,78\n");
    await processCsv(inputPath, outputPath);

    const result = await Bun.file(outputPath).text();
    expect(result).toContain("84.33");
  });

  test("multiple rows processing", async () => {
    const inputPath = join(tempDir, "input.csv");
    const outputPath = join(tempDir, "output.csv");

    await Bun.write(
      inputPath,
      "name,math,science,english\nAlice,85,90,78\nBob,72,88,95\n"
    );
    await processCsv(inputPath, outputPath);

    const result = await Bun.file(outputPath).text();
    const lines = result.trim().split("\n");

    expect(lines.length).toBe(3);
    expect(lines[1]).toContain("253"); // 85+90+78
    expect(lines[2]).toContain("255"); // 72+88+95
  });
});

describe("parseArgs", () => {
  test("parses --input-csv=value and --output-csv=value format", () => {
    const result = parseArgs(["--input-csv=in.csv", "--output-csv=out.csv"]);
    expect(result.inputCsv).toBe("in.csv");
    expect(result.outputCsv).toBe("out.csv");
  });

  test("parses --input-csv value and --output-csv value format", () => {
    const result = parseArgs(["--input-csv", "in.csv", "--output-csv", "out.csv"]);
    expect(result.inputCsv).toBe("in.csv");
    expect(result.outputCsv).toBe("out.csv");
  });

  test("returns null when arguments are not provided", () => {
    const result = parseArgs([]);
    expect(result.inputCsv).toBe(null);
    expect(result.outputCsv).toBe(null);
  });
});
