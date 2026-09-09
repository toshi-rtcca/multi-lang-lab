use crate::error::ExprError;
use crate::lexer::{Token, TokenType, tokenize};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Op {
    Add,
    Sub,
    Mul,
    Div,
}

#[derive(Debug, Clone, PartialEq)]
pub enum Expr {
    Number(i64),
    BinaryOp(Op, Box<Expr>, Box<Expr>),
}

struct Parser {
    tokens: Vec<Token>,
    pos: usize,
}

impl Parser {
    fn peek(&self) -> &Token {
        &self.tokens[self.pos]
    }

    fn advance(&mut self) -> Token {
        let token = self.tokens[self.pos].clone();
        self.pos += 1;
        token
    }

    fn term_op(&self) -> Option<Op> {
        match self.peek().token_type {
            TokenType::Plus => Some(Op::Add),
            TokenType::Minus => Some(Op::Sub),
            _ => None,
        }
    }

    fn factor_op(&self) -> Option<Op> {
        match self.peek().token_type {
            TokenType::Star => Some(Op::Mul),
            TokenType::Slash => Some(Op::Div),
            _ => None,
        }
    }

    /// expr = term, { ("+" | "-"), term } ;
    fn parse_expr(&mut self) -> Result<Expr, ExprError> {
        let mut node = self.parse_term()?;
        while let Some(op) = self.term_op() {
            self.advance();
            let right = self.parse_term()?;
            node = Expr::BinaryOp(op, Box::new(node), Box::new(right));
        }
        Ok(node)
    }

    /// term = factor, { ("*" | "/"), factor } ;
    fn parse_term(&mut self) -> Result<Expr, ExprError> {
        let mut node = self.parse_factor()?;
        while let Some(op) = self.factor_op() {
            self.advance();
            let right = self.parse_factor()?;
            node = Expr::BinaryOp(op, Box::new(node), Box::new(right));
        }
        Ok(node)
    }

    /// factor = number | "(", expr, ")" ;
    fn parse_factor(&mut self) -> Result<Expr, ExprError> {
        let token = self.peek().clone();
        match token.token_type {
            TokenType::Number => {
                self.advance();
                let value: i64 = token
                    .text
                    .parse()
                    .map_err(|_| ExprError::Parse(format!("invalid number '{}'", token.text)))?;
                Ok(Expr::Number(value))
            }
            TokenType::LParen => {
                self.advance();
                let node = self.parse_expr()?;
                if self.peek().token_type != TokenType::RParen {
                    return Err(ExprError::Parse("expected closing ')'".to_string()));
                }
                self.advance();
                Ok(node)
            }
            _ => Err(ExprError::Parse(format!(
                "expected a number or '(', got '{}'",
                token.text
            ))),
        }
    }

    /// Parse a full token stream into an AST, rejecting any trailing tokens.
    fn parse(&mut self) -> Result<Expr, ExprError> {
        let expr = self.parse_expr()?;
        let trailing = self.peek();
        if trailing.token_type != TokenType::Eof {
            return Err(ExprError::Parse(format!(
                "unexpected trailing token '{}'",
                trailing.text
            )));
        }
        Ok(expr)
    }
}

pub fn parse(tokens: Vec<Token>) -> Result<Expr, ExprError> {
    Parser { tokens, pos: 0 }.parse()
}

pub fn evaluate(expr: &Expr) -> Result<i64, ExprError> {
    match expr {
        Expr::Number(value) => Ok(*value),
        Expr::BinaryOp(op, left, right) => {
            let left = evaluate(left)?;
            let right = evaluate(right)?;
            match op {
                Op::Add => Ok(left + right),
                Op::Sub => Ok(left - right),
                Op::Mul => Ok(left * right),
                Op::Div => {
                    if right == 0 {
                        return Err(ExprError::Eval("division by zero".to_string()));
                    }
                    // Rust's integer division already truncates toward zero.
                    Ok(left / right)
                }
            }
        }
    }
}

pub fn parse_and_evaluate(text: &str) -> Result<i64, ExprError> {
    let tokens = tokenize(text)?;
    let expr = parse(tokens)?;
    evaluate(&expr)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn single_number() {
        assert_eq!(parse_and_evaluate("42").unwrap(), 42);
    }

    #[test]
    fn multiplication_binds_tighter_than_addition() {
        assert_eq!(parse_and_evaluate("1 + 2 * 3").unwrap(), 7);
    }

    #[test]
    fn subtraction_is_left_associative() {
        assert_eq!(parse_and_evaluate("10 - 2 - 3").unwrap(), 5);
    }

    #[test]
    fn division_is_left_associative() {
        assert_eq!(parse_and_evaluate("20 / 2 / 5").unwrap(), 2);
    }

    #[test]
    fn nested_parentheses() {
        assert_eq!(parse_and_evaluate("(1 + (2 + 3) * (4 - 1))").unwrap(), 16);
    }

    #[test]
    fn whitespace_insensitive() {
        assert_eq!(parse_and_evaluate("  1 +2*3").unwrap(), 7);
    }

    #[test]
    fn readme_example() {
        assert_eq!(parse_and_evaluate("1 + 2 * (3 - 4)").unwrap(), -1);
    }

    #[test]
    fn division_truncates_toward_zero_not_floor() {
        assert_eq!(parse_and_evaluate("(1 - 4) / 2").unwrap(), -1);
    }

    #[test]
    fn division_by_zero_is_an_eval_error() {
        assert!(matches!(
            parse_and_evaluate("1 / 0"),
            Err(ExprError::Eval(_))
        ));
    }

    #[test]
    fn malformed_input_raises_parse_error() {
        for expression in ["(1 + 2", "1 + 2)", "", "1 + * 2"] {
            assert!(
                matches!(parse_and_evaluate(expression), Err(ExprError::Parse(_))),
                "expected a parse error for {expression:?}"
            );
        }
    }

    #[test]
    fn ast_shape_for_binary_expression() {
        let tokens = tokenize("1 + 2").unwrap();
        let ast = parse(tokens).unwrap();
        assert_eq!(
            ast,
            Expr::BinaryOp(
                Op::Add,
                Box::new(Expr::Number(1)),
                Box::new(Expr::Number(2))
            )
        );
    }
}
