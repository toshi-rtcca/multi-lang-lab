"""Tests for csv_sum_avg.processor module."""

import tempfile
from pathlib import Path

import pytest

from csv_sum_avg.processor import process_csv, CsvProcessingError


def test_process_csv_basic():
    """Test basic CSV processing."""
    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = Path(tmpdir) / "input.csv"
        output_path = Path(tmpdir) / "output.csv"

        input_path.write_text("name,a,b,c\nAlice,10,20,30\n")
        process_csv(input_path, output_path)

        result = output_path.read_text()
        lines = result.strip().split("\n")

        assert lines[0] == "name,a,b,c,SUM,AVG"
        assert lines[1] == "Alice,10,20,30,60,20.00"


def test_process_csv_empty_file():
    """Test error on empty file."""
    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = Path(tmpdir) / "input.csv"
        output_path = Path(tmpdir) / "output.csv"

        input_path.write_text("")

        with pytest.raises(CsvProcessingError, match="empty"):
            process_csv(input_path, output_path)


def test_process_csv_header_only():
    """Test header-only file produces header-only output."""
    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = Path(tmpdir) / "input.csv"
        output_path = Path(tmpdir) / "output.csv"

        input_path.write_text("name,a,b,c\n")
        process_csv(input_path, output_path)

        result = output_path.read_text()
        lines = result.strip().split("\n")

        assert len(lines) == 1
        assert lines[0] == "name,a,b,c,SUM,AVG"


def test_process_csv_non_numeric():
    """Test error on non-numeric value."""
    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = Path(tmpdir) / "input.csv"
        output_path = Path(tmpdir) / "output.csv"

        input_path.write_text("name,a,b\nAlice,10,abc\n")

        with pytest.raises(CsvProcessingError, match="Non-numeric"):
            process_csv(input_path, output_path)


def test_process_csv_avg_rounding():
    """Test AVG is rounded to 2 decimal places."""
    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = Path(tmpdir) / "input.csv"
        output_path = Path(tmpdir) / "output.csv"

        # 85 + 90 + 78 = 253, AVG = 84.333... -> 84.33
        input_path.write_text("name,a,b,c\nAlice,85,90,78\n")
        process_csv(input_path, output_path)

        result = output_path.read_text()
        assert "84.33" in result


def test_process_csv_float_values():
    """Test processing with float values."""
    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = Path(tmpdir) / "input.csv"
        output_path = Path(tmpdir) / "output.csv"

        input_path.write_text("name,a,b\nAlice,10.5,20.5\n")
        process_csv(input_path, output_path)

        result = output_path.read_text()
        lines = result.strip().split("\n")

        # SUM = 31, AVG = 15.50
        assert "31" in lines[1]
        assert "15.50" in lines[1]


def test_process_csv_multiple_rows():
    """Test processing with multiple rows."""
    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = Path(tmpdir) / "input.csv"
        output_path = Path(tmpdir) / "output.csv"

        input_path.write_text(
            "name,math,science,english\n"
            "Alice,85,90,78\n"
            "Bob,72,88,95\n"
        )
        process_csv(input_path, output_path)

        result = output_path.read_text()
        lines = result.strip().split("\n")

        assert len(lines) == 3
        assert "Alice" in lines[1]
        assert "253" in lines[1]  # 85+90+78
        assert "Bob" in lines[2]
        assert "255" in lines[2]  # 72+88+95
