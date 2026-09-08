"""CLI entry point for recursive-descent-parser."""

import argparse
import sys

from .lexer import LexError
from .parser import EvalError, ParseError, parse_and_evaluate


def main() -> None:
    """Run the recursive-descent-parser CLI."""
    parser = argparse.ArgumentParser(
        description="Parse and evaluate an arithmetic expression"
    )
    parser.add_argument("expression", help="Arithmetic expression, e.g. '1 + 2 * 3'")
    args = parser.parse_args()

    try:
        result = parse_and_evaluate(args.expression)
    except (LexError, ParseError, EvalError) as error:
        print(f"Error: {error}", file=sys.stderr)
        raise SystemExit(1) from error

    print(result)
