"""Tests for subprocess_basic.ls_sorter."""

from pathlib import Path
from subprocess import CompletedProcess
from unittest.mock import Mock, patch

import pytest

from subprocess_basic.ls_sorter import (
    FileEntry,
    SortLsError,
    format_entries,
    parse_ls_output,
    sort_entries,
    sort_ls_l,
)


def test_parse_ls_output_extracts_regular_files_only():
    """Parse regular files and ignore total, directories, and symlinks."""
    output = """total 16
drwxr-xr-x  2 user  group  64 Jan  1 00:00 nested
-rw-r--r--  1 user  group  20 Jan  1 00:00 bravo.txt
lrwxr-xr-x  1 user  group   9 Jan  1 00:00 link.txt -> bravo.txt
-rw-r--r--@ 1 user  group  10 Jan  1 00:00 alpha name.txt
"""

    assert parse_ls_output(output) == [
        FileEntry(size=20, filename="bravo.txt"),
        FileEntry(size=10, filename="alpha name.txt"),
    ]


def test_sort_entries_uses_size_descending_then_filename_ascending():
    """Sort by size descending and use filename as the tie-breaker."""
    entries = [
        FileEntry(size=10, filename="charlie.txt"),
        FileEntry(size=20, filename="bravo.txt"),
        FileEntry(size=20, filename="alpha.txt"),
    ]

    assert sort_entries(entries) == [
        FileEntry(size=20, filename="alpha.txt"),
        FileEntry(size=20, filename="bravo.txt"),
        FileEntry(size=10, filename="charlie.txt"),
    ]


def test_format_entries_includes_header_and_trailing_newline():
    """Format the normalized output table."""
    output = format_entries([FileEntry(size=20, filename="bravo.txt")])

    assert output == "size   filename\n20   bravo.txt\n"


def test_format_entries_for_empty_directory_output():
    """Format an empty result as header-only output."""
    assert format_entries([]) == "size   filename\n"


def test_sort_ls_l_matches_shared_expected_fixture():
    """Run ls -l against the shared fixture and match expected output."""
    theme_dir = Path(__file__).resolve().parents[2]
    repo_root = theme_dir.parents[1]
    fixture_dir = repo_root / "shared" / "fixtures" / "subprocess-basic"
    expected = (repo_root / "shared" / "expected" / "subprocess-basic.txt").read_text(
        encoding="utf-8"
    )

    assert sort_ls_l(fixture_dir) == expected


def test_sort_ls_l_rejects_missing_path(tmp_path):
    """Return an error for a missing path before running ls."""
    missing_path = tmp_path / "missing"

    with pytest.raises(SortLsError, match="Path does not exist"):
        sort_ls_l(missing_path)


def test_sort_ls_l_rejects_non_directory(tmp_path):
    """Return an error when the path is not a directory."""
    file_path = tmp_path / "file.txt"
    file_path.write_text("content", encoding="utf-8")

    with pytest.raises(SortLsError, match="Path is not a directory"):
        sort_ls_l(file_path)


def test_sort_ls_l_uses_mocked_subprocess_for_empty_directory(tmp_path):
    """Handle empty ls output with a mocked subprocess."""
    with patch("subprocess_basic.ls_sorter.subprocess.run") as run:
        run.return_value = CompletedProcess(
            args=["ls", "-l", str(tmp_path)],
            returncode=0,
            stdout="total 0\n",
            stderr="",
        )

        assert sort_ls_l(tmp_path) == "size   filename\n"


def test_sort_ls_l_raises_error_when_subprocess_fails(tmp_path):
    """Return an error if the ls subprocess fails."""
    with patch("subprocess_basic.ls_sorter.subprocess.run") as run:
        run.return_value = CompletedProcess(
            args=["ls", "-l", str(tmp_path)],
            returncode=1,
            stdout="",
            stderr="ls failed",
        )

        with pytest.raises(SortLsError, match="ls failed"):
            sort_ls_l(tmp_path)


def test_sort_ls_l_passes_path_to_ls_subprocess(tmp_path):
    """Call ls -l with the requested directory path."""
    run = Mock(
        return_value=CompletedProcess(
            args=["ls", "-l", str(tmp_path)],
            returncode=0,
            stdout="total 0\n",
            stderr="",
        )
    )

    with patch("subprocess_basic.ls_sorter.subprocess.run", run):
        sort_ls_l(tmp_path)

    run.assert_called_once_with(
        ["ls", "-l", str(tmp_path)],
        capture_output=True,
        check=False,
        text=True,
    )

