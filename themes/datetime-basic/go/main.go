package main

import (
	"flag"
	"fmt"
	"math/rand"
	"os"
	"time"
)

const (
	randomSeed = 42
	sleepMinMs = 1000
	sleepMaxMs = 3000
)

func main() {
	inputDate := flag.String("input-date", "", "Date in yyyy-mm-dd format")
	flag.Parse()

	if *inputDate == "" {
		fmt.Fprintln(os.Stderr, "Usage: datetime_basic --input-date <date>")
		os.Exit(1)
	}

	startTime := time.Now()

	fmt.Println("Hi, I'm Dr. Calendar.")
	fmt.Printf("It's %s now.\n", formatDatetime(startTime))
	fmt.Printf("It has been %d since UNIX started.\n", datetimeToTimestamp(startTime))

	targetDate, err := parseDate(*inputDate)
	if err != nil {
		fmt.Printf("Sorry, I don't know about %s.\n", *inputDate)
		fmt.Println("Bye!")
		os.Exit(1)
	}

	fmt.Printf("You'd like to know %s.\n", *inputDate)
	fmt.Println("Thinking...")

	sleepMs := generateSleepMs()
	time.Sleep(time.Duration(sleepMs) * time.Millisecond)

	fmt.Println(getDaysDiff(startTime, targetDate))
	fmt.Printf("It was %s.\n", getWeekdayName(targetDate))

	endTime := time.Now()
	fmt.Printf("We've been talking about for %s seconds.\n", formatElapsedSeconds(startTime, endTime))
	fmt.Println("I'm going to leave.")
	fmt.Println("It's nice talking.")
	fmt.Println("See you, again.")
}

// formatDatetime formats time with microseconds.
func formatDatetime(t time.Time) string {
	return t.Format("2006-01-02 15:04:05.000000")
}

// datetimeToTimestamp converts time to UNIX timestamp as integer.
func datetimeToTimestamp(t time.Time) int64 {
	return t.Unix()
}

// parseDate parses date string in yyyy-mm-dd format.
func parseDate(dateStr string) (time.Time, error) {
	return time.Parse("2006-01-02", dateStr)
}

// getDaysDiff calculates days difference and returns formatted string.
func getDaysDiff(startTime time.Time, targetDate time.Time) string {
	// Normalize both to midnight in local timezone
	startDate := time.Date(startTime.Year(), startTime.Month(), startTime.Day(), 0, 0, 0, 0, startTime.Location())
	target := time.Date(targetDate.Year(), targetDate.Month(), targetDate.Day(), 0, 0, 0, 0, targetDate.Location())

	diff := int(startDate.Sub(target).Hours() / 24)

	if diff == 0 {
		return "It's today."
	} else if diff > 0 {
		return fmt.Sprintf("It's %d days ago.", diff)
	}
	return fmt.Sprintf("It's %d days later.", -diff)
}

// getWeekdayName returns weekday name in English.
func getWeekdayName(t time.Time) string {
	return t.Weekday().String()
}

// formatElapsedSeconds formats elapsed time in seconds with microseconds.
func formatElapsedSeconds(start, end time.Time) string {
	elapsed := end.Sub(start)
	totalMicros := elapsed.Microseconds()
	seconds := (totalMicros / 1_000_000) % 60
	micros := totalMicros % 1_000_000
	return fmt.Sprintf("%02d.%06d", seconds, micros)
}

// generateSleepMs generates random sleep duration in milliseconds.
// Uses a fixed seed for reproducibility.
func generateSleepMs() int {
	rng := rand.New(rand.NewSource(randomSeed))
	return rng.Intn(sleepMaxMs-sleepMinMs+1) + sleepMinMs
}
