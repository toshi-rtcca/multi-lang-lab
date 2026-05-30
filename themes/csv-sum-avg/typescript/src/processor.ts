/**
 * Core CSV processing logic.
 */

export class CsvProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvProcessingError";
  }
}

/**
 * Parse CSV content into rows.
 */
function parseCsv(content: string): string[][] {
  const lines = content.trim().split("\n");
  return lines.map((line) => line.split(","));
}

/**
 * Process CSV file, adding SUM and AVG columns.
 */
export async function processCsv(inputPath: string, outputPath: string): Promise<void> {
  const file = Bun.file(inputPath);

  if (!(await file.exists())) {
    throw new CsvProcessingError(`File not found: ${inputPath}`);
  }

  const content = await file.text();

  // Check for empty file
  if (!content.trim()) {
    throw new CsvProcessingError("CSV file is empty");
  }

  const rows = parseCsv(content);

  if (rows.length === 0) {
    throw new CsvProcessingError("CSV file is empty");
  }

  const header = rows[0];
  const outputHeader = [...header, "SUM", "AVG"];

  const outputRows: string[][] = [outputHeader];

  // Process data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const numericValues: number[] = [];

    // Parse numeric values (skip first column which is label)
    for (let j = 1; j < row.length; j++) {
      const value = parseFloat(row[j]);
      if (isNaN(value)) {
        throw new CsvProcessingError(
          `Non-numeric value '${row[j]}' in column '${header[j]}' at row ${i + 1}`
        );
      }
      numericValues.push(value);
    }

    const sum = numericValues.reduce((a, b) => a + b, 0);
    const avg = numericValues.length > 0 ? sum / numericValues.length : 0;

    // Format SUM: integer if whole number, otherwise float
    const sumStr = Number.isInteger(sum) ? sum.toString() : sum.toString();
    // Format AVG: always 2 decimal places
    const avgStr = avg.toFixed(2);

    outputRows.push([...row, sumStr, avgStr]);
  }

  // Write output
  const outputContent = outputRows.map((row) => row.join(",")).join("\n") + "\n";
  await Bun.write(outputPath, outputContent);
}
