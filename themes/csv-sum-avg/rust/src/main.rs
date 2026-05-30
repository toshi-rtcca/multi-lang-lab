use clap::Parser;
use csv::{ReaderBuilder, WriterBuilder};
use std::fs;
use std::process;

#[derive(Parser)]
struct Args {
    #[arg(long)]
    input_csv: Option<String>,

    #[arg(long)]
    output_csv: Option<String>,
}

#[derive(Debug)]
struct CsvProcessingError(String);

impl std::fmt::Display for CsvProcessingError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

fn process_csv(input_path: &str, output_path: &str) -> Result<(), CsvProcessingError> {
    // Read input file
    let content = fs::read_to_string(input_path)
        .map_err(|e| CsvProcessingError(format!("reading file: {}", e)))?;

    let trimmed = content.trim();
    if trimmed.is_empty() {
        return Err(CsvProcessingError("CSV file is empty".to_string()));
    }

    // Parse CSV
    let mut reader = ReaderBuilder::new()
        .has_headers(true)
        .from_reader(trimmed.as_bytes());

    let headers = reader
        .headers()
        .map_err(|e| CsvProcessingError(format!("parsing CSV headers: {}", e)))?
        .clone();

    // Build output headers
    let mut output_headers: Vec<String> = headers.iter().map(|s| s.to_string()).collect();
    output_headers.push("SUM".to_string());
    output_headers.push("AVG".to_string());

    // Process records
    let mut output_records: Vec<Vec<String>> = Vec::new();

    for (row_idx, result) in reader.records().enumerate() {
        let record = result.map_err(|e| CsvProcessingError(format!("parsing CSV row: {}", e)))?;

        let mut row: Vec<String> = record.iter().map(|s| s.to_string()).collect();
        let mut values: Vec<f64> = Vec::new();

        // Parse numeric values (skip first column which is label)
        for (col_idx, field) in record.iter().enumerate().skip(1) {
            let value: f64 = field.parse().map_err(|_| {
                CsvProcessingError(format!(
                    "non-numeric value '{}' in column '{}' at row {}",
                    field,
                    headers.get(col_idx).unwrap_or("unknown"),
                    row_idx + 2
                ))
            })?;
            values.push(value);
        }

        // Calculate sum and avg
        let sum: f64 = values.iter().sum();
        let avg: f64 = if !values.is_empty() {
            sum / values.len() as f64
        } else {
            0.0
        };

        // Format sum: integer if whole number
        let sum_str = if sum == sum.trunc() {
            format!("{}", sum as i64)
        } else {
            format!("{}", sum)
        };

        // Format avg: always 2 decimal places
        let avg_str = format!("{:.2}", avg);

        row.push(sum_str);
        row.push(avg_str);
        output_records.push(row);
    }

    // Write output
    let file = fs::File::create(output_path)
        .map_err(|e| CsvProcessingError(format!("creating output file: {}", e)))?;

    let mut writer = WriterBuilder::new()
        .terminator(csv::Terminator::Any(b'\n'))
        .from_writer(file);

    writer
        .write_record(&output_headers)
        .map_err(|e| CsvProcessingError(format!("writing CSV header: {}", e)))?;

    for record in output_records {
        writer
            .write_record(&record)
            .map_err(|e| CsvProcessingError(format!("writing CSV row: {}", e)))?;
    }

    writer
        .flush()
        .map_err(|e| CsvProcessingError(format!("flushing CSV writer: {}", e)))?;

    Ok(())
}

fn main() {
    let args = Args::parse();

    let input_path = match args.input_csv {
        Some(path) => path,
        None => {
            eprintln!("Usage: csv_sum_avg --input-csv <path> --output-csv <path>");
            process::exit(1);
        }
    };

    let output_path = match args.output_csv {
        Some(path) => path,
        None => {
            eprintln!("Usage: csv_sum_avg --input-csv <path> --output-csv <path>");
            process::exit(1);
        }
    };

    if let Err(e) = process_csv(&input_path, &output_path) {
        eprintln!("Error: {}", e);
        process::exit(1);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_process_csv_basic() {
        let tmp_dir = TempDir::new().unwrap();
        let input_path = tmp_dir.path().join("input.csv");
        let output_path = tmp_dir.path().join("output.csv");

        fs::write(&input_path, "name,a,b,c\nAlice,10,20,30\n").unwrap();
        process_csv(
            input_path.to_str().unwrap(),
            output_path.to_str().unwrap(),
        )
        .unwrap();

        let result = fs::read_to_string(&output_path).unwrap();
        let lines: Vec<&str> = result.trim().split('\n').collect();

        assert_eq!(lines[0], "name,a,b,c,SUM,AVG");
        assert_eq!(lines[1], "Alice,10,20,30,60,20.00");
    }

    #[test]
    fn test_process_csv_empty_file() {
        let tmp_dir = TempDir::new().unwrap();
        let input_path = tmp_dir.path().join("input.csv");
        let output_path = tmp_dir.path().join("output.csv");

        fs::write(&input_path, "").unwrap();
        let result = process_csv(
            input_path.to_str().unwrap(),
            output_path.to_str().unwrap(),
        );

        assert!(result.is_err());
        assert!(result.unwrap_err().0.contains("empty"));
    }

    #[test]
    fn test_process_csv_header_only() {
        let tmp_dir = TempDir::new().unwrap();
        let input_path = tmp_dir.path().join("input.csv");
        let output_path = tmp_dir.path().join("output.csv");

        fs::write(&input_path, "name,a,b,c\n").unwrap();
        process_csv(
            input_path.to_str().unwrap(),
            output_path.to_str().unwrap(),
        )
        .unwrap();

        let result = fs::read_to_string(&output_path).unwrap();
        let lines: Vec<&str> = result.trim().split('\n').collect();

        assert_eq!(lines.len(), 1);
        assert_eq!(lines[0], "name,a,b,c,SUM,AVG");
    }

    #[test]
    fn test_process_csv_non_numeric() {
        let tmp_dir = TempDir::new().unwrap();
        let input_path = tmp_dir.path().join("input.csv");
        let output_path = tmp_dir.path().join("output.csv");

        fs::write(&input_path, "name,a,b\nAlice,10,abc\n").unwrap();
        let result = process_csv(
            input_path.to_str().unwrap(),
            output_path.to_str().unwrap(),
        );

        assert!(result.is_err());
        assert!(result.unwrap_err().0.contains("non-numeric"));
    }

    #[test]
    fn test_process_csv_avg_rounding() {
        let tmp_dir = TempDir::new().unwrap();
        let input_path = tmp_dir.path().join("input.csv");
        let output_path = tmp_dir.path().join("output.csv");

        // 85 + 90 + 78 = 253, AVG = 84.333... -> 84.33
        fs::write(&input_path, "name,a,b,c\nAlice,85,90,78\n").unwrap();
        process_csv(
            input_path.to_str().unwrap(),
            output_path.to_str().unwrap(),
        )
        .unwrap();

        let result = fs::read_to_string(&output_path).unwrap();
        assert!(result.contains("84.33"));
    }

    #[test]
    fn test_process_csv_multiple_rows() {
        let tmp_dir = TempDir::new().unwrap();
        let input_path = tmp_dir.path().join("input.csv");
        let output_path = tmp_dir.path().join("output.csv");

        fs::write(
            &input_path,
            "name,math,science,english\nAlice,85,90,78\nBob,72,88,95\n",
        )
        .unwrap();
        process_csv(
            input_path.to_str().unwrap(),
            output_path.to_str().unwrap(),
        )
        .unwrap();

        let result = fs::read_to_string(&output_path).unwrap();
        let lines: Vec<&str> = result.trim().split('\n').collect();

        assert_eq!(lines.len(), 3);
        assert!(lines[1].contains("253")); // 85+90+78
        assert!(lines[2].contains("255")); // 72+88+95
    }
}
