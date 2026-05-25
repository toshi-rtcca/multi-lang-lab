"""CSV sum and average calculator CLI tool."""

from .processor import process_csv, CsvProcessingError

__all__ = ["process_csv", "CsvProcessingError"]
