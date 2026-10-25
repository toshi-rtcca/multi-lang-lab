use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};
use std::thread;
use std::time::Duration;

use http_get::{Error, get_status};
use serde::Deserialize;

#[derive(Deserialize)]
struct Case {
    name: String,
    path: Option<String>,
    expected_status: Option<u16>,
    expected_error: Option<String>,
}

fn load_cases() -> Vec<Case> {
    let path = concat!(env!("CARGO_MANIFEST_DIR"), "/../cases.json");
    serde_json::from_str(&fs::read_to_string(path).unwrap()).unwrap()
}

/// Map language-neutral error kinds in cases.json to `http_get::Error`.
fn is_error_kind(err: &Error, kind: &str) -> bool {
    match kind {
        "connect" => matches!(err, Error::Connect(_)),
        _ => false,
    }
}

/// Answer a single HTTP/1.1 request on a raw TCP stream.
fn handle(mut stream: TcpStream) {
    let mut reader = BufReader::new(stream.try_clone().unwrap());
    let mut request_line = String::new();
    reader.read_line(&mut request_line).unwrap();
    // Drain headers until the blank line.
    let mut line = String::new();
    while reader.read_line(&mut line).unwrap() > 2 {
        line.clear();
    }

    let path = request_line.split_whitespace().nth(1).unwrap_or("/");
    let (status, extra) = match path {
        "/ok" => ("200 OK", ""),
        "/error" => ("500 Internal Server Error", ""),
        "/redirect" => ("302 Found", "Location: /ok\r\n"),
        _ => ("404 Not Found", ""),
    };
    let response =
        format!("HTTP/1.1 {status}\r\n{extra}Content-Length: 0\r\nConnection: close\r\n\r\n");
    stream.write_all(response.as_bytes()).unwrap();
}

/// Start a hand-written HTTP server on 127.0.0.1 with an OS-assigned port.
fn start_server() -> String {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let addr = listener.local_addr().unwrap();
    thread::spawn(move || {
        for stream in listener.incoming().flatten() {
            thread::spawn(move || handle(stream));
        }
    });
    format!("http://{addr}")
}

fn closed_port_url() -> String {
    // Bind then drop to obtain a port that nothing listens on.
    let addr = TcpListener::bind("127.0.0.1:0")
        .unwrap()
        .local_addr()
        .unwrap();
    format!("http://{addr}/")
}

#[test]
fn get_status_cases() {
    let base_url = start_server();
    for case in load_cases() {
        if let Some(kind) = &case.expected_error {
            let err = get_status(&closed_port_url(), Duration::from_secs(1)).unwrap_err();
            assert!(is_error_kind(&err, kind), "{}: got {err:?}", case.name);
        } else {
            let url = format!("{base_url}{}", case.path.as_deref().unwrap());
            let status = get_status(&url, Duration::from_secs(5)).unwrap();
            assert_eq!(Some(status), case.expected_status, "{}", case.name);
        }
    }
}
