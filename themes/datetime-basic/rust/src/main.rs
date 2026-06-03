use chrono::{Datelike, Local, NaiveDate, Weekday};
use clap::Parser;
use rand::{Rng, SeedableRng};
use rand::rngs::StdRng;
use std::thread;
use std::time::{Duration, Instant};

const RANDOM_SEED: u64 = 42;
const SLEEP_MIN_MS: u64 = 1000;
const SLEEP_MAX_MS: u64 = 3000;

#[derive(Parser)]
#[command(name = "datetime_basic")]
#[command(about = "Basic datetime operations CLI tool")]
struct Args {
    #[arg(long = "input-date")]
    input_date: String,
}

fn main() {
    let args = Args::parse();

    let start_time = Local::now();
    let start_instant = Instant::now();

    println!("Hi, I'm Dr. Calendar.");
    println!("It's {} now.", format_datetime(&start_time));
    println!(
        "It has been {} since UNIX started.",
        datetime_to_timestamp(&start_time)
    );

    let target_date = match parse_date(&args.input_date) {
        Some(date) => date,
        None => {
            println!("Sorry, I don't know about {}.", args.input_date);
            println!("Bye!");
            std::process::exit(1);
        }
    };

    println!("You'd like to know {}.", args.input_date);
    println!("Thinking...");

    let sleep_ms = generate_sleep_ms();
    thread::sleep(Duration::from_millis(sleep_ms));

    println!("{}", get_days_diff(&start_time.date_naive(), &target_date));
    println!("It was {}.", get_weekday_name(&target_date));

    let elapsed = start_instant.elapsed();
    println!(
        "We've been talking about for {} seconds.",
        format_elapsed_seconds(elapsed)
    );
    println!("I'm going to leave.");
    println!("It's nice talking.");
    println!("See you, again.");
}

/// Format datetime with microseconds.
fn format_datetime(dt: &chrono::DateTime<Local>) -> String {
    dt.format("%Y-%m-%d %H:%M:%S%.6f").to_string()
}

/// Convert datetime to UNIX timestamp as integer.
fn datetime_to_timestamp(dt: &chrono::DateTime<Local>) -> i64 {
    dt.timestamp()
}

/// Parse date string in yyyy-mm-dd format.
fn parse_date(date_str: &str) -> Option<NaiveDate> {
    NaiveDate::parse_from_str(date_str, "%Y-%m-%d").ok()
}

/// Calculate days difference and return formatted string.
fn get_days_diff(start_date: &NaiveDate, target_date: &NaiveDate) -> String {
    let diff = (*start_date - *target_date).num_days();

    if diff == 0 {
        "It's today.".to_string()
    } else if diff > 0 {
        format!("It's {} days ago.", diff)
    } else {
        format!("It's {} days later.", -diff)
    }
}

/// Get weekday name in English.
fn get_weekday_name(date: &NaiveDate) -> String {
    match date.weekday() {
        Weekday::Mon => "Monday",
        Weekday::Tue => "Tuesday",
        Weekday::Wed => "Wednesday",
        Weekday::Thu => "Thursday",
        Weekday::Fri => "Friday",
        Weekday::Sat => "Saturday",
        Weekday::Sun => "Sunday",
    }
    .to_string()
}

/// Format elapsed time in seconds with microseconds.
fn format_elapsed_seconds(elapsed: Duration) -> String {
    let total_micros = elapsed.as_micros();
    let seconds = (total_micros / 1_000_000) % 60;
    let micros = total_micros % 1_000_000;
    format!("{:02}.{:06}", seconds, micros)
}

/// Generate random sleep duration in milliseconds.
/// Uses a fixed seed for reproducibility.
fn generate_sleep_ms() -> u64 {
    let mut rng = StdRng::seed_from_u64(RANDOM_SEED);
    rng.gen_range(SLEEP_MIN_MS..=SLEEP_MAX_MS)
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;

    #[test]
    fn test_format_datetime() {
        let dt = Local.with_ymd_and_hms(2024, 6, 1, 10, 30, 45).unwrap();
        let result = format_datetime(&dt);
        assert!(result.starts_with("2024-06-01 10:30:45."));
    }

    #[test]
    fn test_datetime_to_timestamp() {
        let dt = Local.with_ymd_and_hms(2024, 6, 1, 10, 30, 45).unwrap();
        let result = datetime_to_timestamp(&dt);
        assert!(result > 0);
    }

    #[test]
    fn test_parse_date_valid() {
        let result = parse_date("2024-01-15");
        assert!(result.is_some());
        let date = result.unwrap();
        assert_eq!(date.year(), 2024);
        assert_eq!(date.month(), 1);
        assert_eq!(date.day(), 15);
    }

    #[test]
    fn test_parse_date_invalid() {
        assert!(parse_date("invalid-date").is_none());
        assert!(parse_date("2024/01/15").is_none());
        assert!(parse_date("2023-02-29").is_none());
    }

    #[test]
    fn test_parse_date_leap_year() {
        let result = parse_date("2024-02-29");
        assert!(result.is_some());
    }

    #[test]
    fn test_get_days_diff_today() {
        let date = NaiveDate::from_ymd_opt(2024, 6, 1).unwrap();
        let result = get_days_diff(&date, &date);
        assert_eq!(result, "It's today.");
    }

    #[test]
    fn test_get_days_diff_past() {
        let start = NaiveDate::from_ymd_opt(2024, 6, 10).unwrap();
        let target = NaiveDate::from_ymd_opt(2024, 6, 1).unwrap();
        let result = get_days_diff(&start, &target);
        assert_eq!(result, "It's 9 days ago.");
    }

    #[test]
    fn test_get_days_diff_future() {
        let start = NaiveDate::from_ymd_opt(2024, 6, 1).unwrap();
        let target = NaiveDate::from_ymd_opt(2024, 6, 10).unwrap();
        let result = get_days_diff(&start, &target);
        assert_eq!(result, "It's 9 days later.");
    }

    #[test]
    fn test_get_weekday_name() {
        let monday = NaiveDate::from_ymd_opt(2024, 1, 15).unwrap();
        assert_eq!(get_weekday_name(&monday), "Monday");

        let friday = NaiveDate::from_ymd_opt(2024, 1, 19).unwrap();
        assert_eq!(get_weekday_name(&friday), "Friday");

        let sunday = NaiveDate::from_ymd_opt(2024, 1, 21).unwrap();
        assert_eq!(get_weekday_name(&sunday), "Sunday");
    }

    #[test]
    fn test_format_elapsed_seconds() {
        let elapsed = Duration::from_micros(2_345_678);
        let result = format_elapsed_seconds(elapsed);
        assert_eq!(result, "02.345678");
    }

    #[test]
    fn test_format_elapsed_seconds_zero() {
        let elapsed = Duration::from_micros(0);
        let result = format_elapsed_seconds(elapsed);
        assert_eq!(result, "00.000000");
    }

    #[test]
    fn test_format_elapsed_seconds_over_minute() {
        let elapsed = Duration::from_micros(65_123_456);
        let result = format_elapsed_seconds(elapsed);
        assert_eq!(result, "05.123456");
    }

    #[test]
    fn test_generate_sleep_ms_range() {
        let result = generate_sleep_ms();
        assert!(result >= SLEEP_MIN_MS && result <= SLEEP_MAX_MS);
    }

    #[test]
    fn test_generate_sleep_ms_reproducible() {
        let result1 = generate_sleep_ms();
        let result2 = generate_sleep_ms();
        assert_eq!(result1, result2);
    }
}
