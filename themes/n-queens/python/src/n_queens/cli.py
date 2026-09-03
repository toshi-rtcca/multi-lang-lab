"""CLI entry point for n-queens."""

import argparse
import sys

from .solver import NQueensError, format_solutions, solve


def main() -> None:
    """Run the n-queens CLI."""
    parser = argparse.ArgumentParser(
        description="Solve the N-Queens problem via backtracking"
    )
    parser.add_argument("--n", default="8", help="Board size (number of queens)")
    args = parser.parse_args()

    try:
        n = int(args.n)
    except ValueError:
        print(f"Invalid value for --n: {args.n}", file=sys.stderr)
        raise SystemExit(1) from None

    try:
        solutions = solve(n)
    except NQueensError as error:
        print(error, file=sys.stderr)
        raise SystemExit(1) from error

    print(format_solutions(solutions), end="")
