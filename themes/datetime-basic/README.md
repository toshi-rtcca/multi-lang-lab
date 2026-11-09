# DateTime Basic

## Task

Parse a calendar date strictly and describe it relative to an injected "now":
naive vs. offset-aware types, keeping the offset of `now`, UTC conversion with RFC 3339 output,
date arithmetic, and leap years. The output is deterministic so every language can be diffed against `cases.json`.

| Language | Library | API |
|----------|---------|-----|
| Python | `datetime` | `parse_date(s: str) -> date` (raises `ValueError`), `describe(input_date: str, now: datetime) -> Report` (`now` is aware; `Report` is a dataclass) |
| TypeScript | `Temporal` (built into Bun 1.4.4) | `parseDate(s: string): Temporal.PlainDate` (throws), `describe(inputDate: string, now: Temporal.ZonedDateTime): Report` |
| Go | `time` | `ParseDate(s string) (time.Time, error)`, `Describe(inputDate string, now time.Time) (Report, error)` |
| Rust | `chrono` | `parse_date(s: &str) -> Result<NaiveDate, DateError>`, `describe(input_date: &str, now: DateTime<FixedOffset>) -> Result<Report, DateError>` |

`Report` fields (same meaning everywhere; names follow each language's conventions):

| Field | Type | Definition |
|-------|------|------------|
| `now_local` | string | Wall clock of `now` in its own offset: `YYYY-MM-DD HH:MM:SS.ffffff` (always 6 digits) |
| `now_utc` | string | `now` in UTC as RFC 3339: `YYYY-MM-DDTHH:MM:SS.ffffffZ` (always 6 digits, trailing `Z`) |
| `unix` | int | UNIX seconds, rounded down (floor) |
| `input` | string | The input string, unchanged |
| `weekday` | string | English weekday name of the input date (`Monday`, …) |
| `days_diff` | int | Input date − local date of `now` (in `now`'s offset). Negative for the past |
| `plus_30d` | string | Input date + 30 days (`YYYY-MM-DD`) |
| `is_leap` | bool | Whether the input date's year is a leap year |

Rules:

- **Strict parsing**: the whole string must be `YYYY-MM-DD` (4-digit year, zero-padded 2-digit month and day;
  no sign, no surrounding whitespace, no basic format `YYYYMMDD`), and the date must exist in the calendar.
- Invalid input is named `"invalid-date"` in `cases.json`; each language's tests map it to its own error type.
- **`now` is injected**, never read from the system clock. `now_local` and `days_diff` use `now`'s own offset,
  never the machine's local time zone. Tests pass under both `TZ=UTC` and `TZ=Asia/Tokyo`.
- Sub-second precision is always microseconds, 6 digits (`.000000` included).

Out of scope: named time zones / DST, dates before 1970 for `now` (so floor vs. truncation of `unix` never differs in the cases),
random numbers and sleeping (moved to the `thread-cancel` theme).

Spec: [issue #48](https://github.com/toshi-rtcca/multi-lang-lab/issues/48). This theme replaces the legacy "Dr. Calendar" interactive CLI.

## Test cases

See [`cases.json`](cases.json). Each case has an `input`, a `now` (ISO 8601 with offset), and either `expected` (a full `Report`)
or `expected_error`. Each language's tests convert `now` to their own type before calling `describe`
(TypeScript appends a `[+09:00]` offset annotation so `Temporal.ZonedDateTime.from` accepts it).

The shared `now` is `2026-11-06T05:52:00.123456+09:00`, which is still 2026-11-05 in UTC:
`today-by-offset` expects `days_diff` 0 (using the UTC date would give 1), and `negative-offset` checks the opposite direction.

```sh
make py-test   # or ts-test / go-test / rs-test, or `make test` for all
TZ=Asia/Tokyo make test
```

## Language Comparison

| Aspect | Python | TypeScript | Go | Rust |
|--------|--------|------------|-----|------|
| Library | `datetime` (stdlib) | `Temporal` (global in Bun 1.4.4). The legacy version used `dayjs`, which drops the offset when parsing an ISO string | `time` (stdlib) | `chrono` (crate) |
| Date vs. instant types | `date` / aware `datetime` (same class as naive `datetime`) | `Temporal.PlainDate` / `Temporal.ZonedDateTime` | One type, `time.Time`, for both | `NaiveDate` / `DateTime<FixedOffset>` |
| Leniency of the standard parser | `strptime("%Y-%m-%d")` accepts `2024-1-5`; `date.fromisoformat` accepts `20240115` (and `2024-W03-1`) | `PlainDate.from` accepts `20240115` and `+002024-01-15`; `2024-02-30` is clamped unless `{ overflow: "reject" }` | `time.Parse(time.DateOnly, …)` rejects every invalid case | `NaiveDate::parse_from_str("%Y-%m-%d")` accepts `2024-1-5` and `+2024-01-15` |
| Microseconds | 6 digits | 6 digits (Temporal has nanoseconds; the legacy `dayjs` / `Date` had milliseconds only) | 6 digits | 6 digits |
