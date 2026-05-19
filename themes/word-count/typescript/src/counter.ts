/**
 * Word counting result.
 */
export interface WordCountResult {
  lines: number;
  words: number;
  characters: number;
  most_common_words: { word: string; count: number }[];
}

/**
 * Count lines, words, characters, and find most common words.
 *
 * @param text - Input text to analyze
 * @param topN - Number of top words to return (default: 10)
 * @returns Word count result
 */
export function countWords(text: string, topN: number = 10): WordCountResult {
  // Count lines: number of \n, +1 if no trailing newline
  let lines = 0;
  for (const char of text) {
    if (char === "\n") {
      lines++;
    }
  }
  if (text.length > 0 && !text.endsWith("\n")) {
    lines++;
  }

  // Count characters: Unicode code points, not bytes
  const characters = [...text].length;

  // Find words: alphanumeric + hyphens, case-insensitive
  const wordPattern = /[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*/g;
  const lowerText = text.toLowerCase();
  const wordsList = lowerText.match(wordPattern) ?? [];
  const words = wordsList.length;

  // Count word frequencies
  const wordCounts = new Map<string, number>();
  for (const word of wordsList) {
    wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1);
  }

  // Get top N words sorted by frequency (descending)
  const sortedWords = [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);

  const most_common_words = sortedWords.map(([word, count]) => ({
    word,
    count,
  }));

  return {
    lines,
    words,
    characters,
    most_common_words,
  };
}
