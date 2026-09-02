package main

import (
	"flag"
	"fmt"
	"os"
	"os/exec"
	"sort"
	"strconv"
	"strings"
)

type fileEntry struct {
	size     int
	filename string
}

type processResult struct {
	exitCode int
	stdout   string
	stderr   string
}

type lsRunner func(path string) processResult

func main() {
	path := flag.String("path", "", "Directory path")
	flag.Parse()

	if *path == "" {
		fmt.Fprintln(os.Stderr, "Usage: sort-ls-l --path <path-to-directory>")
		os.Exit(1)
	}

	output, err := sortLsL(*path, runLs)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	fmt.Print(output)
}

func parseLsOutput(output string) []fileEntry {
	entries := []fileEntry{}

	for _, line := range strings.Split(output, "\n") {
		if line == "" || strings.HasPrefix(line, "total ") {
			continue
		}

		fields := strings.Fields(line)
		if len(fields) < 9 {
			continue
		}

		if !strings.HasPrefix(fields[0], "-") {
			continue
		}

		size, err := strconv.Atoi(fields[4])
		if err != nil {
			continue
		}

		prefixEnd := nthFieldEnd(line, 8)
		if prefixEnd < 0 || prefixEnd >= len(line) {
			continue
		}

		entries = append(entries, fileEntry{
			size:     size,
			filename: strings.TrimSpace(line[prefixEnd:]),
		})
	}

	return entries
}

func nthFieldEnd(line string, fieldsToSkip int) int {
	inField := false
	fieldsSeen := 0

	for index, char := range line {
		if char == ' ' || char == '\t' {
			if inField {
				fieldsSeen++
				inField = false
				if fieldsSeen == fieldsToSkip {
					return index
				}
			}
			continue
		}
		inField = true
	}

	return -1
}

func sortEntries(entries []fileEntry) []fileEntry {
	sortedEntries := append([]fileEntry(nil), entries...)
	sort.Slice(sortedEntries, func(i, j int) bool {
		if sortedEntries[i].size != sortedEntries[j].size {
			return sortedEntries[i].size > sortedEntries[j].size
		}
		return sortedEntries[i].filename < sortedEntries[j].filename
	})
	return sortedEntries
}

func formatEntries(entries []fileEntry) string {
	lines := []string{"size   filename"}
	for _, entry := range entries {
		lines = append(lines, fmt.Sprintf("%d   %s", entry.size, entry.filename))
	}
	return strings.Join(lines, "\n") + "\n"
}

func runLs(path string) processResult {
	command := exec.Command("ls", "-l", path)
	output, err := command.Output()
	if err == nil {
		return processResult{exitCode: 0, stdout: string(output), stderr: ""}
	}

	if exitError, ok := err.(*exec.ExitError); ok {
		return processResult{
			exitCode: exitError.ExitCode(),
			stdout:   string(output),
			stderr:   string(exitError.Stderr),
		}
	}

	return processResult{exitCode: 1, stdout: string(output), stderr: err.Error()}
}

func sortLsL(path string, runner lsRunner) (string, error) {
	info, err := os.Stat(path)
	if err != nil {
		if os.IsNotExist(err) {
			return "", fmt.Errorf("Path does not exist: %s", path)
		}
		return "", err
	}

	if !info.IsDir() {
		return "", fmt.Errorf("Path is not a directory: %s", path)
	}

	result := runner(path)
	if result.exitCode != 0 {
		message := strings.TrimSpace(result.stderr)
		if message == "" {
			message = fmt.Sprintf("ls exited with code %d", result.exitCode)
		}
		return "", fmt.Errorf("%s", message)
	}

	return formatEntries(sortEntries(parseLsOutput(result.stdout))), nil
}
