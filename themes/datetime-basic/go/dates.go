// Package datetime_basic parses calendar dates strictly and describes them
// relative to an injected "now".
package datetime_basic

import (
	"errors"
	"fmt"
	"time"
)

// ErrInvalidDate is returned (wrapped) for any input that is not an existing
// date in YYYY-MM-DD form. Match it with errors.Is.
var ErrInvalidDate = errors.New("invalid date")

// Report describes an input date relative to now. The JSON tags match the
// field names in cases.json.
type Report struct {
	NowLocal string `json:"now_local"`
	NowUTC   string `json:"now_utc"`
	Unix     int64  `json:"unix"`
	Input    string `json:"input"`
	Weekday  string `json:"weekday"`
	DaysDiff int    `json:"days_diff"`
	Plus30d  string `json:"plus_30d"`
	IsLeap   bool   `json:"is_leap"`
}

const (
	// Layouts are written with the reference time Mon Jan 2 15:04:05 2006.
	// ".000000" always prints six fractional digits; ".999999" would trim
	// trailing zeros.
	localLayout = "2006-01-02 15:04:05.000000"
	// "Z07:00" prints "Z" for UTC and "+09:00" otherwise.
	utcLayout = "2006-01-02T15:04:05.000000Z07:00"
)

// ParseDate parses exactly YYYY-MM-DD. Go's layout-based parser is already
// strict: "01" and "02" require two digits, "2006" requires four, extra text
// is an error, and nonexistent days ("day out of range") are rejected. The
// result is midnight UTC: Go has no date-only type.
func ParseDate(s string) (time.Time, error) {
	t, err := time.Parse(time.DateOnly, s)
	if err != nil {
		return time.Time{}, fmt.Errorf("%w %q: %w", ErrInvalidDate, s, err)
	}
	return t, nil
}

// IsLeapYear reports whether year is a leap year in the Gregorian calendar.
// The time package has no exported equivalent.
func IsLeapYear(year int) bool {
	return year%4 == 0 && (year%100 != 0 || year%400 == 0)
}

// Describe reports on inputDate relative to now. now keeps its own location
// (offset); the machine's local time zone is never used.
func Describe(inputDate string, now time.Time) (Report, error) {
	d, err := ParseDate(inputDate)
	if err != nil {
		return Report{}, err
	}
	// The calendar date of now in its own offset, as midnight UTC so that it
	// is comparable with d.
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	return Report{
		NowLocal: now.Format(localLayout),
		NowUTC:   now.UTC().Format(utcLayout),
		// Unix floors: a time.Time stores nanoseconds in [0, 1e9).
		Unix:    now.Unix(),
		Input:   inputDate,
		Weekday: d.Weekday().String(),
		// Both are midnight UTC, so the difference is a whole number of days.
		// time.Duration (int64 ns) overflows beyond about 292 years.
		DaysDiff: int(d.Sub(today) / (24 * time.Hour)),
		Plus30d:  d.AddDate(0, 0, 30).Format(time.DateOnly),
		IsLeap:   IsLeapYear(d.Year()),
	}, nil
}
