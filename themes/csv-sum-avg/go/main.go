package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"
)

func main() {
	inputPath := flag.String("input-csv", "", "Input CSV file path")
	outputPath := flag.String("output-csv", "", "Output CSV file path")
	flag.Parse()

	if *inputPath == "" || *outputPath == "" {
		fmt.Fprintln(os.Stderr, "Usage: csv_sum_avg --input-csv <path> --output-csv <path>")
		os.Exit(1)
	}

	if err := processCsv(*inputPath, *outputPath); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}

func processCsv(inputPath, outputPath string) error {
	// Read input file
	data, err := os.ReadFile(inputPath)
	if err != nil {
		return fmt.Errorf("reading file: %w", err)
	}

	content := strings.TrimSpace(string(data))
	if content == "" {
		return fmt.Errorf("CSV file is empty")
	}

	// Parse CSV
	reader := csv.NewReader(strings.NewReader(content))
	records, err := reader.ReadAll()
	if err != nil {
		return fmt.Errorf("parsing CSV: %w", err)
	}

	if len(records) == 0 {
		return fmt.Errorf("CSV file is empty")
	}

	// Process records
	header := records[0]
	outputRecords := make([][]string, 0, len(records))

	// Add SUM and AVG to header
	outputHeader := append(header, "SUM", "AVG")
	outputRecords = append(outputRecords, outputHeader)

	// Process data rows
	for i := 1; i < len(records); i++ {
		row := records[i]
		var values []float64

		// Parse numeric values (skip first column which is label)
		for j := 1; j < len(row); j++ {
			val, err := strconv.ParseFloat(row[j], 64)
			if err != nil {
				return fmt.Errorf("non-numeric value '%s' in column '%s' at row %d", row[j], header[j], i+1)
			}
			values = append(values, val)
		}

		// Calculate sum and avg
		var sum float64
		for _, v := range values {
			sum += v
		}
		var avg float64
		if len(values) > 0 {
			avg = sum / float64(len(values))
		}

		// Format sum: integer if whole number
		var sumStr string
		if sum == float64(int(sum)) {
			sumStr = strconv.Itoa(int(sum))
		} else {
			sumStr = strconv.FormatFloat(sum, 'f', -1, 64)
		}

		// Format avg: always 2 decimal places
		avgStr := fmt.Sprintf("%.2f", avg)

		outputRow := append(row, sumStr, avgStr)
		outputRecords = append(outputRecords, outputRow)
	}

	// Write output file
	file, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("creating output file: %w", err)
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	writer.UseCRLF = false // Use LF only
	if err := writer.WriteAll(outputRecords); err != nil {
		return fmt.Errorf("writing CSV: %w", err)
	}

	return nil
}
