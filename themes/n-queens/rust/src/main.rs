use std::env;
use std::process::ExitCode;

fn main() -> ExitCode {
    let n_arg = parse_n_arg(env::args().skip(1));

    let Ok(n) = n_arg.parse::<i64>() else {
        eprintln!("Invalid value for --n: {}", n_arg);
        return ExitCode::from(1);
    };

    match solve(n) {
        Ok(solutions) => {
            print!("{}", format_solutions(&solutions));
            ExitCode::SUCCESS
        }
        Err(error) => {
            eprintln!("{}", error);
            ExitCode::from(1)
        }
    }
}

fn parse_n_arg<I>(args: I) -> String
where
    I: IntoIterator<Item = String>,
{
    let mut n = "8".to_string();
    let mut args = args.into_iter();

    while let Some(arg) = args.next() {
        if let Some(value) = arg.strip_prefix("--n=") {
            n = value.to_string();
        } else if arg == "--n" {
            if let Some(value) = args.next() {
                n = value;
            }
        }
    }

    n
}

fn is_safe(columns: &[i32], row: usize, col: i32) -> bool {
    for placed_row in 0..row {
        let placed_col = columns[placed_row];
        if placed_col == col || (placed_col - col).abs() == (placed_row as i32 - row as i32).abs() {
            return false;
        }
    }
    true
}

fn solve(n: i64) -> Result<Vec<Vec<i32>>, String> {
    if n < 1 {
        return Err(format!("n must be >= 1, got {}", n));
    }

    let n = n as usize;
    let mut results: Vec<Vec<i32>> = Vec::new();
    let mut columns: Vec<i32> = vec![0; n];

    backtrack(0, n, &mut columns, &mut results);

    Ok(results)
}

fn backtrack(row: usize, n: usize, columns: &mut Vec<i32>, results: &mut Vec<Vec<i32>>) {
    if row == n {
        results.push(columns.clone());
        return;
    }

    for col in 0..n as i32 {
        if is_safe(columns, row, col) {
            columns[row] = col;
            backtrack(row + 1, n, columns, results);
        }
    }
}

fn format_solutions(solutions: &[Vec<i32>]) -> String {
    let mut lines: Vec<String> = solutions
        .iter()
        .map(|solution| {
            solution
                .iter()
                .map(|col| col.to_string())
                .collect::<Vec<_>>()
                .join(" ")
        })
        .collect();
    lines.push(format!("Total solutions: {}", solutions.len()));
    format!("{}\n", lines.join("\n"))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn is_valid_solution(columns: &[i32]) -> bool {
        for row_a in 0..columns.len() {
            for row_b in (row_a + 1)..columns.len() {
                let col_a = columns[row_a];
                let col_b = columns[row_b];
                if col_a == col_b || (col_a - col_b).abs() == (row_a as i32 - row_b as i32).abs() {
                    return false;
                }
            }
        }
        true
    }

    #[test]
    fn test_solve_returns_92_solutions_for_n_8() {
        let solutions = solve(8).unwrap();
        assert_eq!(solutions.len(), 92);
    }

    #[test]
    fn test_solve_solutions_are_valid() {
        let solutions = solve(8).unwrap();
        assert!(solutions.iter().all(|solution| is_valid_solution(solution)));
    }

    #[test]
    fn test_solve_solutions_are_distinct() {
        let solutions = solve(8).unwrap();
        let unique: std::collections::HashSet<_> = solutions.iter().collect();
        assert_eq!(unique.len(), solutions.len());
    }

    #[test]
    fn test_solve_n_1_returns_single_solution() {
        assert_eq!(solve(1).unwrap(), vec![vec![0]]);
    }

    #[test]
    fn test_solve_returns_no_solutions_for_n_2_and_n_3() {
        assert_eq!(solve(2).unwrap(), Vec::<Vec<i32>>::new());
        assert_eq!(solve(3).unwrap(), Vec::<Vec<i32>>::new());
    }

    #[test]
    fn test_solve_rejects_invalid_n() {
        assert!(solve(0).is_err());
        assert!(solve(-1).is_err());
    }

    #[test]
    fn test_is_safe_detects_column_conflict() {
        assert!(!is_safe(&[0], 1, 0));
    }

    #[test]
    fn test_is_safe_detects_diagonal_conflict() {
        assert!(!is_safe(&[0], 1, 1));
    }

    #[test]
    fn test_is_safe_allows_non_conflicting_placement() {
        assert!(is_safe(&[0], 1, 2));
    }

    #[test]
    fn test_format_solutions_includes_total_count_and_trailing_newline() {
        assert_eq!(format_solutions(&[vec![0]]), "0\nTotal solutions: 1\n");
    }

    #[test]
    fn test_format_solutions_for_no_solutions() {
        assert_eq!(format_solutions(&[]), "Total solutions: 0\n");
    }

    #[test]
    fn test_parse_n_arg() {
        assert_eq!(
            parse_n_arg(["--n".to_string(), "4".to_string()]),
            "4".to_string()
        );
        assert_eq!(parse_n_arg(["--n=4".to_string()]), "4".to_string());
        assert_eq!(parse_n_arg(Vec::<String>::new()), "8".to_string());
    }
}
