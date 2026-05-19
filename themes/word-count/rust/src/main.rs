use clap::Parser;
use regex::Regex;
use serde::Serialize;
use std::collections::HashMap;
use std::fs;
use std::process;

#[derive(Parser)]
struct Args {
    #[arg(long)]
    input: Option<String>,
}

#[derive(Serialize)]
struct WordCount {
    word: String,
    count: usize,
}

#[derive(Serialize)]
struct CountResult {
    lines: usize,
    words: usize,
    characters: usize,
    most_common_words: Vec<WordCount>,
}

/// Count lines, words, characters, and find most common words.
fn count_words(text: &str, top_n: usize) -> CountResult {
    // Count lines: number of \n, +1 if no trailing newline
    let mut lines = text.matches('\n').count();
    if !text.is_empty() && !text.ends_with('\n') {
        lines += 1;
    }

    // Count characters: Unicode code points, not bytes
    let characters = text.chars().count();

    // Find words: alphanumeric + hyphens, case-insensitive
    let word_pattern = Regex::new(r"[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*").unwrap();
    let lower_text = text.to_lowercase();
    let words_list: Vec<&str> = word_pattern.find_iter(&lower_text).map(|m| m.as_str()).collect();
    let words = words_list.len();

    // Count word frequencies
    let mut word_counts: HashMap<&str, usize> = HashMap::new();
    for word in &words_list {
        *word_counts.entry(word).or_insert(0) += 1;
    }

    // Sort by frequency (descending) and get top N
    let mut freqs: Vec<(&str, usize)> = word_counts.into_iter().collect();
    freqs.sort_by(|a, b| b.1.cmp(&a.1));

    let most_common_words: Vec<WordCount> = freqs
        .into_iter()
        .take(top_n)
        .map(|(word, count)| WordCount {
            word: word.to_string(),
            count,
        })
        .collect();

    CountResult {
        lines,
        words,
        characters,
        most_common_words,
    }
}

fn main() {
    let args = Args::parse();

    let input_path = match args.input {
        Some(path) => path,
        None => {
            eprintln!("Usage: word_count --input <file_path>");
            process::exit(1);
        }
    };

    let text = match fs::read_to_string(&input_path) {
        Ok(content) => content,
        Err(e) => {
            eprintln!("Error reading file: {}", e);
            process::exit(1);
        }
    };

    let result = count_words(&text, 10);

    match serde_json::to_string_pretty(&result) {
        Ok(json) => println!("{}", json),
        Err(e) => {
            eprintln!("Error encoding JSON: {}", e);
            process::exit(1);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_count_words_basic() {
        let text = "Hello world\nHello Python\n";
        let result = count_words(text, 10);

        assert_eq!(result.lines, 2);
        assert_eq!(result.words, 4);
        assert_eq!(result.characters, 25);
        assert_eq!(result.most_common_words.len(), 3);
        assert_eq!(result.most_common_words[0].word, "hello");
        assert_eq!(result.most_common_words[0].count, 2);
    }

    #[test]
    fn test_count_words_empty() {
        let result = count_words("", 10);

        assert_eq!(result.lines, 0);
        assert_eq!(result.words, 0);
        assert_eq!(result.characters, 0);
        assert!(result.most_common_words.is_empty());
    }

    #[test]
    fn test_count_words_case_insensitive() {
        let text = "The THE the tHe";
        let result = count_words(text, 10);

        assert_eq!(result.words, 4);
        assert_eq!(result.most_common_words[0].word, "the");
        assert_eq!(result.most_common_words[0].count, 4);
    }

    #[test]
    fn test_count_words_hyphenated() {
        let text = "self-aware self-aware non-trivial";
        let result = count_words(text, 10);

        assert_eq!(result.words, 3);
        assert_eq!(result.most_common_words[0].word, "self-aware");
        assert_eq!(result.most_common_words[0].count, 2);
    }

    #[test]
    fn test_count_words_no_trailing_newline() {
        let text = "one\ntwo\nthree";
        let result = count_words(text, 10);

        assert_eq!(result.lines, 3);
    }

    #[test]
    fn test_count_words_top_n() {
        let text = "a a a b b c d e f g h i j k";
        let result = count_words(text, 3);

        assert_eq!(result.most_common_words.len(), 3);
        assert_eq!(result.most_common_words[0].word, "a");
        assert_eq!(result.most_common_words[1].word, "b");
    }

    #[test]
    fn test_count_words_unicode() {
        // Japanese characters: each is 1 character (not 3 bytes)
        let text = "こんにちは";
        let result = count_words(text, 10);

        assert_eq!(result.characters, 5);
    }
}
