use std::fmt;

/// One error type spans all three pipeline stages, so the CLI layer only
/// ever has to match on a single `Result` error type.
#[derive(Debug)]
pub enum ExprError {
    Lex(String),
    Parse(String),
    Eval(String),
}

impl fmt::Display for ExprError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ExprError::Lex(msg) | ExprError::Parse(msg) | ExprError::Eval(msg) => {
                write!(f, "{msg}")
            }
        }
    }
}
