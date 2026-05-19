package main

import (
	"testing"
)

func TestCountWordsBasic(t *testing.T) {
	text := "Hello world\nHello Python\n"
	result := CountWords(text, 10)

	if result.Lines != 2 {
		t.Errorf("expected lines=2, got %d", result.Lines)
	}
	if result.Words != 4 {
		t.Errorf("expected words=4, got %d", result.Words)
	}
	if result.Characters != 25 {
		t.Errorf("expected characters=25, got %d", result.Characters)
	}
	if len(result.MostCommonWords) != 3 {
		t.Errorf("expected 3 most common words, got %d", len(result.MostCommonWords))
	}
	if result.MostCommonWords[0].Word != "hello" || result.MostCommonWords[0].Count != 2 {
		t.Errorf("expected most common word to be 'hello' with count 2, got %v", result.MostCommonWords[0])
	}
}

func TestCountWordsEmpty(t *testing.T) {
	result := CountWords("", 10)

	if result.Lines != 0 {
		t.Errorf("expected lines=0, got %d", result.Lines)
	}
	if result.Words != 0 {
		t.Errorf("expected words=0, got %d", result.Words)
	}
	if result.Characters != 0 {
		t.Errorf("expected characters=0, got %d", result.Characters)
	}
	if len(result.MostCommonWords) != 0 {
		t.Errorf("expected 0 most common words, got %d", len(result.MostCommonWords))
	}
}

func TestCountWordsCaseInsensitive(t *testing.T) {
	text := "The THE the tHe"
	result := CountWords(text, 10)

	if result.Words != 4 {
		t.Errorf("expected words=4, got %d", result.Words)
	}
	if result.MostCommonWords[0].Word != "the" || result.MostCommonWords[0].Count != 4 {
		t.Errorf("expected most common word to be 'the' with count 4, got %v", result.MostCommonWords[0])
	}
}

func TestCountWordsHyphenated(t *testing.T) {
	text := "self-aware self-aware non-trivial"
	result := CountWords(text, 10)

	if result.Words != 3 {
		t.Errorf("expected words=3, got %d", result.Words)
	}
	if result.MostCommonWords[0].Word != "self-aware" || result.MostCommonWords[0].Count != 2 {
		t.Errorf("expected most common word to be 'self-aware' with count 2, got %v", result.MostCommonWords[0])
	}
}

func TestCountWordsNoTrailingNewline(t *testing.T) {
	text := "one\ntwo\nthree"
	result := CountWords(text, 10)

	if result.Lines != 3 {
		t.Errorf("expected lines=3, got %d", result.Lines)
	}
}

func TestCountWordsTopN(t *testing.T) {
	text := "a a a b b c d e f g h i j k"
	result := CountWords(text, 3)

	if len(result.MostCommonWords) != 3 {
		t.Errorf("expected 3 most common words, got %d", len(result.MostCommonWords))
	}
	if result.MostCommonWords[0].Word != "a" {
		t.Errorf("expected first word to be 'a', got %s", result.MostCommonWords[0].Word)
	}
	if result.MostCommonWords[1].Word != "b" {
		t.Errorf("expected second word to be 'b', got %s", result.MostCommonWords[1].Word)
	}
}

func TestCountWordsUnicode(t *testing.T) {
	// Japanese characters: each is 1 character (not 3 bytes)
	text := "こんにちは"
	result := CountWords(text, 10)

	if result.Characters != 5 {
		t.Errorf("expected characters=5, got %d", result.Characters)
	}
}
