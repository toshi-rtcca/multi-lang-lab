use std::env;
use std::fs;
use std::path::Path;
use std::process::{Command, ExitCode};

#[derive(Debug, Clone, PartialEq, Eq)]
struct FileEntry {
    size: u64,
    filename: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct ProcessResult {
    exit_code: i32,
    stdout: String,
    stderr: String,
}

type LsRunner = fn(&str) -> ProcessResult;

fn main() -> ExitCode {
    let Some(path) = parse_path_arg(env::args().skip(1)) else {
        eprintln!("Usage: sort-ls-l --path <path-to-directory>");
        return ExitCode::from(1);
    };

    match sort_ls_l(&path, run_ls) {
        Ok(output) => {
            print!("{}", output);
            ExitCode::SUCCESS
        }
        Err(error) => {
            eprintln!("{}", error);
            ExitCode::from(1)
        }
    }
}

fn parse_path_arg<I>(args: I) -> Option<String>
where
    I: IntoIterator<Item = String>,
{
    let mut args = args.into_iter();

    while let Some(arg) = args.next() {
        if let Some(path) = arg.strip_prefix("--path=") {
            return Some(path.to_string());
        }
        if arg == "--path" {
            return args.next();
        }
    }

    None
}

fn parse_ls_output(output: &str) -> Vec<FileEntry> {
    let mut entries = Vec::new();

    for line in output.lines() {
        if line.is_empty() || line.starts_with("total ") {
            continue;
        }

        let fields: Vec<&str> = line.split_whitespace().collect();
        if fields.len() < 9 {
            continue;
        }

        if !fields[0].starts_with('-') {
            continue;
        }

        let Ok(size) = fields[4].parse::<u64>() else {
            continue;
        };

        let Some(filename_start) = nth_field_end(line, 8) else {
            continue;
        };

        entries.push(FileEntry {
            size,
            filename: line[filename_start..].trim().to_string(),
        });
    }

    entries
}

fn nth_field_end(line: &str, fields_to_skip: usize) -> Option<usize> {
    let mut in_field = false;
    let mut fields_seen = 0;

    for (index, character) in line.char_indices() {
        if character == ' ' || character == '\t' {
            if in_field {
                fields_seen += 1;
                in_field = false;
                if fields_seen == fields_to_skip {
                    return Some(index);
                }
            }
            continue;
        }
        in_field = true;
    }

    None
}

fn sort_entries(entries: &[FileEntry]) -> Vec<FileEntry> {
    let mut sorted_entries = entries.to_vec();
    sorted_entries.sort_by(|left, right| {
        right
            .size
            .cmp(&left.size)
            .then_with(|| left.filename.cmp(&right.filename))
    });
    sorted_entries
}

fn format_entries(entries: &[FileEntry]) -> String {
    let mut lines = vec!["size   filename".to_string()];
    lines.extend(
        entries
            .iter()
            .map(|entry| format!("{}   {}", entry.size, entry.filename)),
    );
    format!("{}\n", lines.join("\n"))
}

fn run_ls(path: &str) -> ProcessResult {
    match Command::new("ls").arg("-l").arg(path).output() {
        Ok(output) => ProcessResult {
            exit_code: output.status.code().unwrap_or(1),
            stdout: String::from_utf8_lossy(&output.stdout).to_string(),
            stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        },
        Err(error) => ProcessResult {
            exit_code: 1,
            stdout: String::new(),
            stderr: error.to_string(),
        },
    }
}

fn sort_ls_l(path: &str, runner: LsRunner) -> Result<String, String> {
    let target = Path::new(path);

    if !target.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    let metadata = fs::metadata(target).map_err(|error| error.to_string())?;
    if !metadata.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    let result = runner(path);
    if result.exit_code != 0 {
        let message = result.stderr.trim();
        if message.is_empty() {
            return Err(format!("ls exited with code {}", result.exit_code));
        }
        return Err(message.to_string());
    }

    Ok(format_entries(&sort_entries(&parse_ls_output(
        &result.stdout,
    ))))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn test_parse_path_arg() {
        assert_eq!(
            parse_path_arg(["--path".to_string(), "fixtures".to_string()]),
            Some("fixtures".to_string())
        );
        assert_eq!(
            parse_path_arg(["--path=fixtures".to_string()]),
            Some("fixtures".to_string())
        );
        assert_eq!(parse_path_arg(Vec::<String>::new()), None);
    }

    #[test]
    fn test_parse_ls_output_extracts_regular_files_only() {
        let output = "total 16
drwxr-xr-x  2 user  group  64 Jan  1 00:00 nested
-rw-r--r--  1 user  group  20 Jan  1 00:00 bravo.txt
lrwxr-xr-x  1 user  group   9 Jan  1 00:00 link.txt -> bravo.txt
-rw-r--r--@ 1 user  group  10 Jan  1 00:00 alpha name.txt
";

        assert_eq!(
            parse_ls_output(output),
            vec![
                FileEntry {
                    size: 20,
                    filename: "bravo.txt".to_string()
                },
                FileEntry {
                    size: 10,
                    filename: "alpha name.txt".to_string()
                }
            ]
        );
    }

    #[test]
    fn test_sort_entries_uses_size_descending_then_filename_ascending() {
        let entries = vec![
            FileEntry {
                size: 10,
                filename: "charlie.txt".to_string(),
            },
            FileEntry {
                size: 20,
                filename: "bravo.txt".to_string(),
            },
            FileEntry {
                size: 20,
                filename: "alpha.txt".to_string(),
            },
        ];

        assert_eq!(
            sort_entries(&entries),
            vec![
                FileEntry {
                    size: 20,
                    filename: "alpha.txt".to_string(),
                },
                FileEntry {
                    size: 20,
                    filename: "bravo.txt".to_string(),
                },
                FileEntry {
                    size: 10,
                    filename: "charlie.txt".to_string(),
                },
            ]
        );
    }

    #[test]
    fn test_format_entries_includes_header_and_trailing_newline() {
        let entries = vec![FileEntry {
            size: 20,
            filename: "bravo.txt".to_string(),
        }];

        assert_eq!(
            format_entries(&entries),
            "size   filename\n20   bravo.txt\n"
        );
    }

    #[test]
    fn test_format_entries_for_empty_directory_output() {
        assert_eq!(format_entries(&[]), "size   filename\n");
    }

    #[test]
    fn test_sort_ls_l_rejects_missing_path() {
        let path = env::temp_dir().join("subprocess-basic-missing-path");
        let error = sort_ls_l(path.to_str().unwrap(), run_ls).unwrap_err();

        assert!(error.contains("Path does not exist"));
    }

    #[test]
    fn test_sort_ls_l_rejects_non_directory() {
        let file_path =
            env::temp_dir().join(format!("subprocess-basic-file-{}", std::process::id()));
        let mut file = fs::File::create(&file_path).unwrap();
        writeln!(file, "content").unwrap();

        let error = sort_ls_l(file_path.to_str().unwrap(), run_ls).unwrap_err();
        fs::remove_file(&file_path).unwrap();

        assert!(error.contains("Path is not a directory"));
    }

    #[test]
    fn test_sort_ls_l_uses_mocked_runner_for_empty_directory() {
        fn runner(_: &str) -> ProcessResult {
            ProcessResult {
                exit_code: 0,
                stdout: "total 0\n".to_string(),
                stderr: String::new(),
            }
        }

        let output = sort_ls_l(env::temp_dir().to_str().unwrap(), runner).unwrap();
        assert_eq!(output, "size   filename\n");
    }

    #[test]
    fn test_sort_ls_l_raises_error_when_subprocess_fails() {
        fn runner(_: &str) -> ProcessResult {
            ProcessResult {
                exit_code: 1,
                stdout: String::new(),
                stderr: "ls failed".to_string(),
            }
        }

        let error = sort_ls_l(env::temp_dir().to_str().unwrap(), runner).unwrap_err();
        assert!(error.contains("ls failed"));
    }
}
