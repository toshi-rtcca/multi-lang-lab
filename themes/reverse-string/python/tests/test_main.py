import subprocess
import sys

import pytest

from reverse_string.main import reverse_graphemes


class TestReverseGraphemes:
    """Unit tests for reverse_graphemes function."""

    def test_ascii(self):
        assert reverse_graphemes("asdf") == "fdsa"

    def test_combining_characters(self):
        # s with combining enclosing circle, f with combining overline
        assert reverse_graphemes("as⃝df̅") == "f̅ds⃝a"

    def test_japanese(self):
        assert reverse_graphemes("ようこそ,世界に!") == "!に界世,そこうよ"

    def test_zwj_emoji(self):
        # Family emoji (ZWJ sequence) should stay as single cluster
        assert reverse_graphemes("👨‍👩‍👧‍👦") == "👨‍👩‍👧‍👦"

    def test_empty_string(self):
        assert reverse_graphemes("") == ""

    def test_single_character(self):
        assert reverse_graphemes("a") == "a"

    def test_emoji_sequence(self):
        # Multiple emoji should reverse
        assert reverse_graphemes("🍎🍊🍋") == "🍋🍊🍎"


class TestCLI:
    """Integration tests for CLI behavior."""

    def test_with_argument(self):
        result = subprocess.run(
            [sys.executable, "-m", "reverse_string.main", "asdf"],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        assert result.stdout == "fdsa\n"

    def test_without_argument(self):
        result = subprocess.run(
            [sys.executable, "-m", "reverse_string.main"],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 1
        assert "Usage:" in result.stderr

    def test_empty_string_argument(self):
        result = subprocess.run(
            [sys.executable, "-m", "reverse_string.main", ""],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        assert result.stdout == "\n"
