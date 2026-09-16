mod error;
mod lexer;
mod parser;

use std::env;
use std::process::ExitCode;

fn main() -> ExitCode {
    let expression = match env::args().nth(1) {
        Some(expr) => expr,
        None => {
            eprintln!("Error: missing EXPRESSION argument");
            return ExitCode::from(1);
        }
    };

    match parser::parse_and_evaluate(&expression) {
        Ok(result) => {
            println!("{result}");
            ExitCode::SUCCESS
        }
        Err(error) => {
            eprintln!("Error: {error}");
            ExitCode::from(1)
        }
    }
}
