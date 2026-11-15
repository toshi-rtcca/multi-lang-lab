use std::collections::HashSet;
use std::fs;
use std::time::Duration;

use serde::Deserialize;
use thread_cancel::{Status, pick_duration, run_with_timeout};

#[derive(Deserialize)]
struct Case {
    name: String,
    op: String,
    duration_ms: Option<u64>,
    timeout_ms: Option<u64>,
    expected_status: Option<String>,
    expected_elapsed_ms: Option<u64>,
    tolerance_ms: Option<u64>,
    seed: Option<u64>,
    seed_from: Option<u64>,
    seed_to: Option<u64>,
    min: Option<u64>,
    max: Option<u64>,
}

fn cases(op: &str) -> Vec<Case> {
    let path = concat!(env!("CARGO_MANIFEST_DIR"), "/../cases.json");
    let all: Vec<Case> = serde_json::from_str(&fs::read_to_string(path).unwrap()).unwrap();
    all.into_iter().filter(|c| c.op == op).collect()
}

fn status_name(s: Status) -> &'static str {
    match s {
        Status::Completed => "completed",
        Status::Cancelled => "cancelled",
    }
}

#[test]
fn run_cases() {
    for c in cases("run") {
        let outcome = run_with_timeout(
            Duration::from_millis(c.duration_ms.unwrap()),
            Duration::from_millis(c.timeout_ms.unwrap()),
        );
        assert_eq!(
            status_name(outcome.status),
            c.expected_status.as_deref().unwrap(),
            "{}",
            c.name
        );
        let expected = Duration::from_millis(c.expected_elapsed_ms.unwrap());
        let diff = outcome.elapsed.abs_diff(expected);
        assert!(
            diff <= Duration::from_millis(c.tolerance_ms.unwrap()),
            "{}: elapsed {:?}, expected {:?}",
            c.name,
            outcome.elapsed,
            expected
        );
    }
}

#[test]
fn pick_cases() {
    for c in cases("pick") {
        let v = pick_duration(c.seed.unwrap());
        assert!(
            (c.min.unwrap()..=c.max.unwrap()).contains(&v),
            "{}: {v}",
            c.name
        );
    }
}

#[test]
fn pick_repeat_cases() {
    for c in cases("pick-repeat") {
        let seed = c.seed.unwrap();
        assert_eq!(pick_duration(seed), pick_duration(seed), "{}", c.name);
    }
}

#[test]
fn pick_range_cases() {
    for c in cases("pick-range") {
        let range = c.min.unwrap()..=c.max.unwrap();
        for seed in c.seed_from.unwrap()..=c.seed_to.unwrap() {
            let v = pick_duration(seed);
            assert!(range.contains(&v), "{}: seed {seed} -> {v}", c.name);
        }
    }
}

#[test]
fn pick_hits_both_ends() {
    let seen: HashSet<u64> = (0..100_000).map(pick_duration).collect();
    assert!(seen.contains(&1000));
    assert!(seen.contains(&5000));
}
