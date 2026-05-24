import sys

import grapheme


def reverse_graphemes(s: str) -> str:
    """Reverse a string at the grapheme cluster level."""
    return "".join(reversed(list(grapheme.graphemes(s))))


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: reverse-string <input-string>", file=sys.stderr)
        sys.exit(1)

    input_string = sys.argv[1]
    print(reverse_graphemes(input_string))


if __name__ == "__main__":
    main()
