# subprocess-basic

## CLI Interface

```sh
sort-ls-l --path <path-to-directory>
```

## Input

- `--path`: Path to the directory to inspect.

## Task

Run `ls -l <path-to-directory>` as a subprocess, receive its stdout, extract file sizes and filenames, sort them, and print a normalized table.

This theme focuses on subprocess execution, stdout handling, and sorting. The raw `ls -l` lines are not printed directly because owner, group, timestamp, and permission formats can vary by environment.

## Output Format

Print two columns: `size` and `filename`.

- The header is exactly:

```text
size   filename
```

- The separator between columns is three ASCII spaces.
- Each data row is formatted as:

```text
<size>   <filename>
```

- `size` is the file size in bytes parsed from `ls -l` stdout.
- `filename` is the filename parsed from `ls -l` stdout.
- Output ends with a trailing newline.

### Example Output

```text
size   filename
100   juliet.txt
90   india.txt
80   hotel.txt
```

## Processing Rules

1. Accept `--path <path-to-directory>` as the required CLI argument.
2. Return exit code `1` if the path does not exist.
3. Return exit code `1` if the path is not a directory.
4. Run `ls -l <path-to-directory>` as a subprocess.
5. Read stdout from the subprocess.
6. Ignore the `total` line from `ls -l`.
7. Extract regular file entries from the `ls -l` output.
8. For each regular file entry, extract:
   - file size
   - filename
9. Sort rows by:
   1. `size` descending
   2. `filename` ascending when sizes are equal
10. Print the normalized output table to stdout.

## Empty Directory

If the directory contains no regular files, return exit code `0` and print only the header:

```text
size   filename
```

## Edge Cases

- **Path does not exist**: Exit with code `1` and print an error message to stderr.
- **Path is not a directory**: Exit with code `1` and print an error message to stderr.
- **Directory contains no regular files**: Exit with code `0` and print only the header.
- **Subprocess returns a non-zero exit code**: Exit with code `1` and print an error message to stderr.

## Exit Codes

- `0`: Success.
- `1`: Error, such as missing path, non-directory path, or subprocess failure.

