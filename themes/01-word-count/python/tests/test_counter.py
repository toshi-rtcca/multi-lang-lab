"""Tests for word_count.counter module."""

from word_count.counter import count_words


def test_count_words_basic():
    """Test basic word counting."""
    text = "Hello world\nHello Python\n"
    result = count_words(text)

    assert result["lines"] == 2
    assert result["words"] == 4
    assert result["characters"] == 25
    assert len(result["most_common_words"]) == 3
    assert result["most_common_words"][0] == {"word": "hello", "count": 2}


def test_count_words_empty():
    """Test empty file handling."""
    result = count_words("")

    assert result["lines"] == 0
    assert result["words"] == 0
    assert result["characters"] == 0
    assert result["most_common_words"] == []


def test_count_words_case_insensitive():
    """Test case insensitivity."""
    text = "The THE the tHe"
    result = count_words(text)

    assert result["words"] == 4
    assert result["most_common_words"][0] == {"word": "the", "count": 4}


def test_count_words_hyphenated():
    """Test hyphenated words are treated as single words."""
    text = "self-aware self-aware non-trivial"
    result = count_words(text)

    assert result["words"] == 3
    assert result["most_common_words"][0] == {"word": "self-aware", "count": 2}


def test_count_words_no_trailing_newline():
    """Test file without trailing newline."""
    text = "one\ntwo\nthree"
    result = count_words(text)

    assert result["lines"] == 3


def test_count_words_top_n():
    """Test top_n parameter."""
    text = "a a a b b c d e f g h i j k"
    result = count_words(text, top_n=3)

    assert len(result["most_common_words"]) == 3
    assert result["most_common_words"][0]["word"] == "a"
    assert result["most_common_words"][1]["word"] == "b"
