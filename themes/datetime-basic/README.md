# DateTime Basic

## Task
Parse a date string, calculate date differences, and display various datetime information through an interactive CLI conversation with "Dr. Calendar".

## Learning Goals
- Date/time parsing and formatting
- UNIX timestamp conversion
- Date arithmetic (difference calculation)
- Day of week extraction
- Random number generation
- Sleep/delay functionality

## Language Comparison

| Feature | Python | TypeScript | Go | Rust |
|---------|--------|------------|-----|------|
| DateTime library | `datetime` | `dayjs` | `time` | `chrono` |
| Parse date | `strptime()` | `dayjs(str, format)` | `time.Parse()` | `NaiveDate::parse_from_str()` |
| Format datetime | `strftime()` | `format()` | `Format()` | `format()` |
| UNIX timestamp | `timestamp()` | `unix()` | `Unix()` | `timestamp()` |
| Date diff | `timedelta.days` | `diff(d, 'day')` | `Sub().Hours()/24` | `signed_duration_since()` |
| Day of week | `strftime('%A')` | `format('dddd')` | `Weekday().String()` | `weekday()` |
| Random (seeded) | `random.seed()` | Manual PRNG | `rand.NewSource()` | `rand::SeedableRng` |
| Sleep | `time.sleep()` | `Bun.sleep()` | `time.Sleep()` | `thread::sleep()` |
| Microseconds | 6 digits | 3 digits (ms) | 6 digits | 6 digits |
