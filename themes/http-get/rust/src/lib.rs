//! Return HTTP status codes with ureq.

use std::fmt;
use std::io;
use std::time::Duration;

/// Transport failures. Non-2xx responses are not errors.
#[derive(Debug)]
pub enum Error {
    /// The TCP connection could not be established (e.g. connection refused).
    Connect(io::Error),
    /// Any other ureq failure (timeout, bad URL, protocol error, ...).
    Other(ureq::Error),
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Connect(e) => write!(f, "connect error: {e}"),
            Error::Other(e) => write!(f, "{e}"),
        }
    }
}

impl std::error::Error for Error {}

impl From<ureq::Error> for Error {
    fn from(e: ureq::Error) -> Self {
        match e {
            ureq::Error::Io(io) if is_connect_failure(io.kind()) => Error::Connect(io),
            other => Error::Other(other),
        }
    }
}

fn is_connect_failure(kind: io::ErrorKind) -> bool {
    matches!(
        kind,
        io::ErrorKind::ConnectionRefused
            | io::ErrorKind::ConnectionReset
            | io::ErrorKind::HostUnreachable
            | io::ErrorKind::NetworkUnreachable
    )
}

/// Return the status code of a GET request.
pub fn get_status(url: &str, timeout: Duration) -> Result<u16, Error> {
    let agent: ureq::Agent = ureq::Agent::config_builder()
        .timeout_global(Some(timeout))
        // ureq 3 turns 4xx/5xx into Err(Error::StatusCode) by default.
        // Disable that so every status code is a value.
        .http_status_as_error(false)
        // 0 = never follow redirects; the 3xx response is returned as-is.
        .max_redirects(0)
        .build()
        .into();
    let response = agent.get(url).call()?;
    Ok(response.status().as_u16())
}
