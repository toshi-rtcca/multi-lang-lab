//! Strict date parsing and a deterministic report relative to an injected `now`.

use std::fmt;

use chrono::{DateTime, Days, FixedOffset, NaiveDate, SecondsFormat, Utc};

/// Errors from [`parse_date`] and [`describe`].
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DateError {
    /// The input is not an existing date in `YYYY-MM-DD` form.
    InvalidDate { input: String },
}

impl fmt::Display for DateError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DateError::InvalidDate { input } => write!(f, "invalid date: {input:?}"),
        }
    }
}

impl std::error::Error for DateError {}

/// Describes an input date relative to `now`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Report {
    pub now_local: String,
    pub now_utc: String,
    pub unix: i64,
    pub input: String,
    pub weekday: String,
    pub days_diff: i64,
    pub plus_30d: String,
    pub is_leap: bool,
}

/// `NaiveDate::parse_from_str(s, "%Y-%m-%d")` also accepts "2024-1-5",
/// "+2024-01-15" and " 2024-01-15", so check the exact shape first:
/// ten ASCII bytes, digits except for '-' at index 4 and 7.
fn has_date_shape(s: &str) -> bool {
    let b = s.as_bytes();
    b.len() == 10
        && b.iter().enumerate().all(|(i, c)| match i {
            4 | 7 => *c == b'-',
            _ => c.is_ascii_digit(),
        })
}

/// Parses exactly `YYYY-MM-DD` into a date without time or offset.
pub fn parse_date(s: &str) -> Result<NaiveDate, DateError> {
    let invalid = || DateError::InvalidDate {
        input: s.to_owned(),
    };
    if !has_date_shape(s) {
        return Err(invalid());
    }
    // chrono checks the calendar: 2023-02-29 and 2024-13-01 fail here.
    NaiveDate::parse_from_str(s, "%Y-%m-%d").map_err(|_| invalid())
}

/// Describes `input_date` relative to `now`, using `now`'s own offset.
pub fn describe(input_date: &str, now: DateTime<FixedOffset>) -> Result<Report, DateError> {
    let d = parse_date(input_date)?;
    // A 4-digit year plus 30 days is far below NaiveDate::MAX (year 262142).
    let plus_30d = d
        .checked_add_days(Days::new(30))
        .expect("a 4-digit year cannot overflow NaiveDate");
    Ok(Report {
        // `%.6f` always prints a dot and six digits.
        now_local: now.format("%Y-%m-%d %H:%M:%S%.6f").to_string(),
        // use_z = true prints "Z" instead of "+00:00".
        now_utc: now
            .with_timezone(&Utc)
            .to_rfc3339_opts(SecondsFormat::Micros, true),
        // timestamp() floors: chrono stores non-negative nanoseconds.
        unix: now.timestamp(),
        input: input_date.to_owned(),
        // `%A` is always English in chrono (no locale support by default).
        weekday: d.format("%A").to_string(),
        // date_naive() is the local date in now's offset.
        days_diff: (d - now.date_naive()).num_days(),
        plus_30d: plus_30d.to_string(),
        is_leap: d.leap_year(),
    })
}
