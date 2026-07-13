"""Utilities for running and sorting ls -l output."""

from __future__ import annotations

import subprocess
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class FileEntry:
    """A normalized file entry parsed from ls -l output."""

    size: int
    filename: str


class SortLsError(Exception):
    """Raised when sort-ls-l cannot complete successfully."""


def parse_ls_output(output: str) -> list[FileEntry]:
    """Parse regular file entries from ls -l stdout."""
    entries: list[FileEntry] = []

    for line in output.splitlines():
        if not line or line.startswith("total "):
            continue

        fields = line.split(maxsplit=8)
        if len(fields) < 9:
            continue

        permissions = fields[0]
        if not permissions.startswith("-"):
            continue

        try:
            size = int(fields[4])
        except ValueError:
            continue

        entries.append(FileEntry(size=size, filename=fields[8]))

    return entries


def sort_entries(entries: list[FileEntry]) -> list[FileEntry]:
    """Sort entries by size descending, then filename ascending."""
    return sorted(entries, key=lambda entry: (-entry.size, entry.filename))


def format_entries(entries: list[FileEntry]) -> str:
    """Format entries as the normalized output table."""
    lines = ["size   filename"]
    lines.extend(f"{entry.size}   {entry.filename}" for entry in entries)
    return "\n".join(lines) + "\n"


def sort_ls_l(path: Path) -> str:
    """Run ls -l for a directory and return sorted normalized output."""
    if not path.exists():
        raise SortLsError(f"Path does not exist: {path}")

    if not path.is_dir():
        raise SortLsError(f"Path is not a directory: {path}")

    result = subprocess.run(
        ["ls", "-l", str(path)],
        capture_output=True,
        check=False,
        text=True,
    )

    if result.returncode != 0:
        message = result.stderr.strip() or f"ls exited with code {result.returncode}"
        raise SortLsError(message)

    return format_entries(sort_entries(parse_ls_output(result.stdout)))

