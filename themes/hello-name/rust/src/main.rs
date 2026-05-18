use clap::Parser;
use std::process;

#[derive(Parser)]
struct Args {
    #[arg(long)]
    name: Option<String>,
}

fn main() {
    let args = Args::parse();

    match args.name {
        Some(name) => println!("Hello, {}!", name),
        None => {
            eprintln!("Sorry, may I have your name?");
            process::exit(1);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_args_parsing() {
        // Test that Args struct can be created
        let args = Args { name: Some("World".to_string()) };
        assert_eq!(args.name, Some("World".to_string()));
    }
}
