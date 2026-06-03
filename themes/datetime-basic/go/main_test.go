package main

import (
	"testing"
	"time"
)

func TestFormatDatetime(t *testing.T) {
	tests := []struct {
		name     string
		input    time.Time
		expected string
	}{
		{
			name:     "basic datetime",
			input:    time.Date(2024, 6, 1, 10, 30, 45, 123456000, time.UTC),
			expected: "2024-06-01 10:30:45.123456",
		},
		{
			name:     "zero microseconds",
			input:    time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC),
			expected: "2024-01-01 00:00:00.000000",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatDatetime(tt.input)
			if result != tt.expected {
				t.Errorf("formatDatetime(%v) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestDatetimeToTimestamp(t *testing.T) {
	// Test that it returns an integer
	tm := time.Date(2024, 6, 1, 10, 30, 45, 123456000, time.UTC)
	result := datetimeToTimestamp(tm)
	if result <= 0 {
		t.Errorf("datetimeToTimestamp should return positive integer, got %d", result)
	}

	// Test Unix epoch
	epoch := time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
	epochResult := datetimeToTimestamp(epoch)
	if epochResult != 0 {
		t.Errorf("datetimeToTimestamp(epoch) = %d, want 0", epochResult)
	}
}

func TestParseDate(t *testing.T) {
	tests := []struct {
		name      string
		input     string
		wantErr   bool
		wantYear  int
		wantMonth time.Month
		wantDay   int
	}{
		{
			name:      "valid date",
			input:     "2024-01-15",
			wantErr:   false,
			wantYear:  2024,
			wantMonth: time.January,
			wantDay:   15,
		},
		{
			name:    "invalid format",
			input:   "invalid-date",
			wantErr: true,
		},
		{
			name:    "wrong separator",
			input:   "2024/01/15",
			wantErr: true,
		},
		{
			name:      "leap year",
			input:     "2024-02-29",
			wantErr:   false,
			wantYear:  2024,
			wantMonth: time.February,
			wantDay:   29,
		},
		{
			name:    "non-leap year Feb 29",
			input:   "2023-02-29",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := parseDate(tt.input)
			if (err != nil) != tt.wantErr {
				t.Errorf("parseDate(%q) error = %v, wantErr %v", tt.input, err, tt.wantErr)
				return
			}
			if !tt.wantErr {
				if result.Year() != tt.wantYear {
					t.Errorf("parseDate(%q).Year() = %d, want %d", tt.input, result.Year(), tt.wantYear)
				}
				if result.Month() != tt.wantMonth {
					t.Errorf("parseDate(%q).Month() = %v, want %v", tt.input, result.Month(), tt.wantMonth)
				}
				if result.Day() != tt.wantDay {
					t.Errorf("parseDate(%q).Day() = %d, want %d", tt.input, result.Day(), tt.wantDay)
				}
			}
		})
	}
}

func TestGetDaysDiff(t *testing.T) {
	tests := []struct {
		name     string
		start    time.Time
		target   time.Time
		expected string
	}{
		{
			name:     "same day",
			start:    time.Date(2024, 6, 1, 10, 0, 0, 0, time.UTC),
			target:   time.Date(2024, 6, 1, 0, 0, 0, 0, time.UTC),
			expected: "It's today.",
		},
		{
			name:     "past date",
			start:    time.Date(2024, 6, 10, 0, 0, 0, 0, time.UTC),
			target:   time.Date(2024, 6, 1, 0, 0, 0, 0, time.UTC),
			expected: "It's 9 days ago.",
		},
		{
			name:     "future date",
			start:    time.Date(2024, 6, 1, 0, 0, 0, 0, time.UTC),
			target:   time.Date(2024, 6, 10, 0, 0, 0, 0, time.UTC),
			expected: "It's 9 days later.",
		},
		{
			name:     "one day ago",
			start:    time.Date(2024, 6, 2, 0, 0, 0, 0, time.UTC),
			target:   time.Date(2024, 6, 1, 0, 0, 0, 0, time.UTC),
			expected: "It's 1 days ago.",
		},
		{
			name:     "one day later",
			start:    time.Date(2024, 6, 1, 0, 0, 0, 0, time.UTC),
			target:   time.Date(2024, 6, 2, 0, 0, 0, 0, time.UTC),
			expected: "It's 1 days later.",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := getDaysDiff(tt.start, tt.target)
			if result != tt.expected {
				t.Errorf("getDaysDiff(%v, %v) = %q, want %q", tt.start, tt.target, result, tt.expected)
			}
		})
	}
}

func TestGetWeekdayName(t *testing.T) {
	tests := []struct {
		name     string
		input    time.Time
		expected string
	}{
		{
			name:     "Monday",
			input:    time.Date(2024, 1, 15, 0, 0, 0, 0, time.UTC),
			expected: "Monday",
		},
		{
			name:     "Friday",
			input:    time.Date(2024, 1, 19, 0, 0, 0, 0, time.UTC),
			expected: "Friday",
		},
		{
			name:     "Sunday",
			input:    time.Date(2024, 1, 21, 0, 0, 0, 0, time.UTC),
			expected: "Sunday",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := getWeekdayName(tt.input)
			if result != tt.expected {
				t.Errorf("getWeekdayName(%v) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestFormatElapsedSeconds(t *testing.T) {
	tests := []struct {
		name     string
		start    time.Time
		end      time.Time
		expected string
	}{
		{
			name:     "basic elapsed time",
			start:    time.Date(2024, 1, 1, 10, 0, 0, 0, time.UTC),
			end:      time.Date(2024, 1, 1, 10, 0, 2, 345678000, time.UTC),
			expected: "02.345678",
		},
		{
			name:     "zero elapsed time",
			start:    time.Date(2024, 1, 1, 10, 0, 0, 0, time.UTC),
			end:      time.Date(2024, 1, 1, 10, 0, 0, 0, time.UTC),
			expected: "00.000000",
		},
		{
			name:     "over a minute",
			start:    time.Date(2024, 1, 1, 10, 0, 0, 0, time.UTC),
			end:      time.Date(2024, 1, 1, 10, 1, 5, 123456000, time.UTC),
			expected: "05.123456",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatElapsedSeconds(tt.start, tt.end)
			if result != tt.expected {
				t.Errorf("formatElapsedSeconds(%v, %v) = %q, want %q", tt.start, tt.end, result, tt.expected)
			}
		})
	}
}

func TestGenerateSleepMs(t *testing.T) {
	result := generateSleepMs()

	// Check range
	if result < sleepMinMs || result > sleepMaxMs {
		t.Errorf("generateSleepMs() = %d, want between %d and %d", result, sleepMinMs, sleepMaxMs)
	}

	// Check reproducibility
	result2 := generateSleepMs()
	if result != result2 {
		t.Errorf("generateSleepMs() not reproducible: got %d and %d", result, result2)
	}
}
