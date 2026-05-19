package main

import (
	"regexp"
	"sort"
	"strings"
	"unicode/utf8"
)

// WordCount represents a word and its frequency.
type WordCount struct {
	Word  string `json:"word"`
	Count int    `json:"count"`
}

// CountResult represents the result of word counting.
type CountResult struct {
	Lines           int         `json:"lines"`
	Words           int         `json:"words"`
	Characters      int         `json:"characters"`
	MostCommonWords []WordCount `json:"most_common_words"`
}

// CountWords counts lines, words, characters, and finds most common words.
func CountWords(text string, topN int) CountResult {
	// Count lines: number of \n, +1 if no trailing newline
	lines := strings.Count(text, "\n")
	if len(text) > 0 && !strings.HasSuffix(text, "\n") {
		lines++
	}

	// Count characters: Unicode code points, not bytes
	characters := utf8.RuneCountInString(text)

	// Find words: alphanumeric + hyphens, case-insensitive
	wordPattern := regexp.MustCompile(`[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*`)
	lowerText := strings.ToLower(text)
	wordsList := wordPattern.FindAllString(lowerText, -1)
	words := len(wordsList)

	// Count word frequencies
	wordCounts := make(map[string]int)
	for _, word := range wordsList {
		wordCounts[word]++
	}

	// Sort by frequency (descending) and get top N
	type wordFreq struct {
		word  string
		count int
	}
	var freqs []wordFreq
	for word, count := range wordCounts {
		freqs = append(freqs, wordFreq{word, count})
	}
	sort.Slice(freqs, func(i, j int) bool {
		return freqs[i].count > freqs[j].count
	})

	mostCommonWords := make([]WordCount, 0, topN)
	for i := 0; i < len(freqs) && i < topN; i++ {
		mostCommonWords = append(mostCommonWords, WordCount{
			Word:  freqs[i].word,
			Count: freqs[i].count,
		})
	}

	return CountResult{
		Lines:           lines,
		Words:           words,
		Characters:      characters,
		MostCommonWords: mostCommonWords,
	}
}
