use std::env;
use std::process;
use unicode_segmentation::UnicodeSegmentation;

fn reverse_graphemes(s: &str) -> String {
    s.graphemes(true).rev().collect()
}

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        eprintln!("Usage: reverse-string <input-string>");
        process::exit(1);
    }

    println!("{}", reverse_graphemes(&args[1]));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ascii() {
        assert_eq!(reverse_graphemes("asdf"), "fdsa");
    }

    #[test]
    fn test_combining_characters() {
        // s with combining enclosing circle, f with combining overline
        assert_eq!(reverse_graphemes("as⃝df̅"), "f̅ds⃝a");
    }

    #[test]
    fn test_japanese() {
        assert_eq!(reverse_graphemes("ようこそ,世界に!"), "!に界世,そこうよ");
    }

    #[test]
    fn test_zwj_emoji() {
        // Family emoji (ZWJ sequence) should stay as single cluster
        assert_eq!(reverse_graphemes("👨‍👩‍👧‍👦"), "👨‍👩‍👧‍👦");
    }

    #[test]
    fn test_empty_string() {
        assert_eq!(reverse_graphemes(""), "");
    }

    #[test]
    fn test_single_character() {
        assert_eq!(reverse_graphemes("a"), "a");
    }

    #[test]
    fn test_emoji_sequence() {
        assert_eq!(reverse_graphemes("🍎🍊🍋"), "🍋🍊🍎");
    }
}
