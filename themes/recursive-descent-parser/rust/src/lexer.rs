use crate::error::ExprError;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TokenType {
    Number,
    Plus,
    Minus,
    Star,
    Slash,
    LParen,
    RParen,
    Eof,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Token {
    pub token_type: TokenType,
    pub text: String,
}

/// Convert an expression string into tokens, terminated by a single Eof token.
pub fn tokenize(input: &str) -> Result<Vec<Token>, ExprError> {
    let chars: Vec<char> = input.chars().collect();
    let mut tokens = Vec::new();
    let mut pos = 0;

    while pos < chars.len() {
        let ch = chars[pos];

        if ch.is_whitespace() {
            pos += 1;
            continue;
        }

        if ch.is_ascii_digit() {
            let start = pos;
            while pos < chars.len() && chars[pos].is_ascii_digit() {
                pos += 1;
            }
            let text: String = chars[start..pos].iter().collect();
            tokens.push(Token {
                token_type: TokenType::Number,
                text,
            });
            continue;
        }

        let token_type = match ch {
            '+' => TokenType::Plus,
            '-' => TokenType::Minus,
            '*' => TokenType::Star,
            '/' => TokenType::Slash,
            '(' => TokenType::LParen,
            ')' => TokenType::RParen,
            _ => {
                return Err(ExprError::Lex(format!(
                    "unexpected character '{ch}' at position {pos}"
                )));
            }
        };
        tokens.push(Token {
            token_type,
            text: ch.to_string(),
        });
        pos += 1;
    }

    tokens.push(Token {
        token_type: TokenType::Eof,
        text: String::new(),
    });
    Ok(tokens)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn token_types(tokens: &[Token]) -> Vec<TokenType> {
        tokens.iter().map(|t| t.token_type).collect()
    }

    #[test]
    fn tokenize_single_number() {
        let tokens = tokenize("42").unwrap();
        assert_eq!(
            token_types(&tokens),
            vec![TokenType::Number, TokenType::Eof]
        );
        assert_eq!(tokens[0].text, "42");
    }

    #[test]
    fn tokenize_all_operators_and_parens() {
        let tokens = tokenize("1+2-3*4/5(6)").unwrap();
        assert_eq!(
            token_types(&tokens),
            vec![
                TokenType::Number,
                TokenType::Plus,
                TokenType::Number,
                TokenType::Minus,
                TokenType::Number,
                TokenType::Star,
                TokenType::Number,
                TokenType::Slash,
                TokenType::Number,
                TokenType::LParen,
                TokenType::Number,
                TokenType::RParen,
                TokenType::Eof,
            ]
        );
    }

    #[test]
    fn tokenize_ignores_whitespace() {
        let tokens = tokenize("  1 +  2\t*3\n").unwrap();
        assert_eq!(
            token_types(&tokens),
            vec![
                TokenType::Number,
                TokenType::Plus,
                TokenType::Number,
                TokenType::Star,
                TokenType::Number,
                TokenType::Eof,
            ]
        );
    }

    #[test]
    fn tokenize_empty_input_yields_only_eof() {
        let tokens = tokenize("   ").unwrap();
        assert_eq!(token_types(&tokens), vec![TokenType::Eof]);
    }

    #[test]
    fn tokenize_rejects_unrecognized_character() {
        assert!(tokenize("1 + a").is_err());
    }
}
