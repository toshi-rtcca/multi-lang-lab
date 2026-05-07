"""CLI entry point for word_count."""

import argparse
import json
from pathlib import Path

from .counter import count_words


def main() -> None:
    """Main entry point for the word_count CLI."""
    parser = argparse.ArgumentParser(description="Count words in a text file")
    parser.add_argument("--input", required=True, type=Path, help="Input file path")
    args = parser.parse_args()

    text = args.input.read_text(encoding="utf-8")
    result = count_words(text)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
