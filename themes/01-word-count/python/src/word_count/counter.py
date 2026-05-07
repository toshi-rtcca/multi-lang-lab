"""Core word counting logic."""

import re
from collections import Counter


def count_words(text: str, top_n: int = 10) -> dict:
    """Count lines, words, characters, and find most common words.

    Args:
        text: Input text to analyze
        top_n: Number of top words to return

    Returns:
        Dictionary with lines, words, characters, and most_common_words
    """
    lines = text.count("\n")
    if text and not text.endswith("\n"):
        lines += 1

    characters = len(text)

    # Word definition: alphanumeric + hyphens, case-insensitive
    word_pattern = re.compile(r"[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*")
    words_list = word_pattern.findall(text.lower())
    words = len(words_list)

    word_counts = Counter(words_list)
    most_common = [
        {"word": word, "count": count}
        for word, count in word_counts.most_common(top_n)
    ]

    return {
        "lines": lines,
        "words": words,
        "characters": characters,
        "most_common_words": most_common,
    }
