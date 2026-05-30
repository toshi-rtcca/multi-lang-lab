"""Core CSV processing logic."""

import csv
from pathlib import Path


class CsvProcessingError(Exception):
    """Raised when CSV processing fails."""

    pass


def process_csv(input_path: Path, output_path: Path) -> None:
    """Process CSV file, adding SUM and AVG columns.

    Args:
        input_path: Path to input CSV file
        output_path: Path to output CSV file

    Raises:
        CsvProcessingError: If CSV is empty or contains non-numeric values
        FileNotFoundError: If input file does not exist
    """
    content = input_path.read_text(encoding="utf-8")

    # Check for empty file
    if not content.strip():
        raise CsvProcessingError("CSV file is empty")

    lines = content.strip().split("\n")

    reader = csv.DictReader(lines)
    fieldnames = reader.fieldnames

    if fieldnames is None:
        raise CsvProcessingError("CSV file is empty")

    # Identify numeric columns (all except first)
    label_column = fieldnames[0]
    numeric_columns = fieldnames[1:]

    # Read all rows and validate/compute
    output_rows = []
    for row_num, row in enumerate(reader, start=2):
        values = []
        for col in numeric_columns:
            try:
                values.append(float(row[col]))
            except ValueError:
                raise CsvProcessingError(
                    f"Non-numeric value '{row[col]}' in column '{col}' at row {row_num}"
                )

        row_sum = sum(values)
        row_avg = round(row_sum / len(values), 2) if values else 0.0

        row["SUM"] = int(row_sum) if row_sum == int(row_sum) else row_sum
        row["AVG"] = f"{row_avg:.2f}"
        output_rows.append(row)

    # Write output
    output_fieldnames = list(fieldnames) + ["SUM", "AVG"]
    with output_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=output_fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(output_rows)
