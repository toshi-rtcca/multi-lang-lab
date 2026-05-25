"""CLI entry point for csv_sum_avg."""

import argparse
import sys
from pathlib import Path

from .processor import process_csv, CsvProcessingError


def main() -> None:
    """Main entry point for the csv_sum_avg CLI."""
    parser = argparse.ArgumentParser(description="Add SUM and AVG columns to CSV")
    parser.add_argument(
        "--input-csv", required=True, type=Path, help="Input CSV file path"
    )
    parser.add_argument(
        "--output-csv", required=True, type=Path, help="Output CSV file path"
    )
    args = parser.parse_args()

    try:
        process_csv(args.input_csv, args.output_csv)
    except CsvProcessingError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
