use chrono::DateTime;
use datetime_basic::{DateError, Report, describe, parse_date};
use serde_json::Value;

fn load_cases() -> Vec<Value> {
    let path = concat!(env!("CARGO_MANIFEST_DIR"), "/../cases.json");
    let text = std::fs::read_to_string(path).expect("read cases.json");
    serde_json::from_str(&text).expect("parse cases.json")
}

fn str_field(v: &Value, key: &str) -> String {
    v[key]
        .as_str()
        .unwrap_or_else(|| panic!("{key} is not a string"))
        .to_owned()
}

fn int_field(v: &Value, key: &str) -> i64 {
    v[key]
        .as_i64()
        .unwrap_or_else(|| panic!("{key} is not an integer"))
}

fn report_from_json(v: &Value) -> Report {
    Report {
        now_local: str_field(v, "now_local"),
        now_utc: str_field(v, "now_utc"),
        unix: int_field(v, "unix"),
        input: str_field(v, "input"),
        weekday: str_field(v, "weekday"),
        days_diff: int_field(v, "days_diff"),
        plus_30d: str_field(v, "plus_30d"),
        is_leap: v["is_leap"].as_bool().expect("is_leap is not a bool"),
    }
}

/// Maps a language-neutral error name to whether `err` is that error.
fn matches_error(name: &str, err: &DateError) -> bool {
    matches!((name, err), ("invalid-date", DateError::InvalidDate { .. }))
}

#[test]
fn cases_json() {
    for case in load_cases() {
        let name = str_field(&case, "name");
        let input = str_field(&case, "input");
        let now = DateTime::parse_from_rfc3339(&str_field(&case, "now")).expect("now");
        let result = describe(&input, now);
        if let Some(expected) = case.get("expected_error").and_then(Value::as_str) {
            match result {
                Err(err) => assert!(matches_error(expected, &err), "{name}: got {err:?}"),
                Ok(report) => panic!("{name}: expected {expected}, got {report:?}"),
            }
        } else {
            let expected = report_from_json(&case["expected"]);
            assert_eq!(result, Ok(expected), "{name}");
        }
    }
}

#[test]
fn rejects_what_parse_from_str_alone_accepts() {
    for s in ["2024-1-5", "+2024-01-15", " 2024-01-15", "２０２４-01-15"] {
        assert!(
            matches!(parse_date(s), Err(DateError::InvalidDate { .. })),
            "{s:?}"
        );
    }
}

#[test]
fn error_display() {
    let err = parse_date("2024-02-30").unwrap_err();
    assert_eq!(err.to_string(), r#"invalid date: "2024-02-30""#);
}
