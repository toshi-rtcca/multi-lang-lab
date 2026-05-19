import argparse
import sys


def main() -> None:
    """Main entry point for the hello_name CLI."""
    parser = argparse.ArgumentParser()
    parser.add_argument("--name", type=str)
    args = parser.parse_args()

    if args.name is None:
        print("Sorry, may I have your name?", file=sys.stderr)
        sys.exit(1)

    print(f"Hello, {args.name}!")


if __name__ == "__main__":
    main()
