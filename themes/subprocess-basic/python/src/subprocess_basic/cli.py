"""CLI entry point for sort-ls-l."""

import argparse
import sys
from pathlib import Path

from .ls_sorter import SortLsError, sort_ls_l


def main() -> None:
    """Run the sort-ls-l CLI."""
    parser = argparse.ArgumentParser(description="Sort ls -l output by file size")
    parser.add_argument("--path", required=True, type=Path, help="Directory path")
    args = parser.parse_args()

    try:
        output = sort_ls_l(args.path)
    except SortLsError as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from error

    print(output, end="")

