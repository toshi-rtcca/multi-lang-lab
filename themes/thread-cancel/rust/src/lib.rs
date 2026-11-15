//! One child thread, a timeout, and cooperative cancellation with std only (no async runtime).

use std::sync::Arc;
use std::sync::mpsc::{self, RecvTimeoutError};
use std::thread;
use std::time::{Duration, Instant};

use rand::rngs::StdRng;
use rand::{Rng, SeedableRng};

/// How the child ended.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Status {
    Completed,
    Cancelled,
}

/// The result of [`run_with_timeout`].
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Outcome {
    pub status: Status,
    pub elapsed: Duration,
}

/// Returns a duration in ms within 1000..=5000 (both ends inclusive), deterministic per seed.
pub fn pick_duration(seed: u64) -> u64 {
    let mut rng = StdRng::seed_from_u64(seed);
    // `..=` is inclusive; `1000..5000` would never return 5000.
    rng.random_range(1000..=5000)
}

/// Runs one child for `duration` and cancels it cooperatively if it is still
/// running after `timeout`. Always joins the child before returning.
pub fn run_with_timeout(duration: Duration, timeout: Duration) -> Outcome {
    run(duration, timeout, Arc::new(()))
}

/// `guard` is moved into the child; tests use its strong count to see that the
/// child's closure has been dropped (i.e. the thread has finished) on return.
fn run(duration: Duration, timeout: Duration, guard: Arc<()>) -> Outcome {
    let start = Instant::now(); // monotonic

    // Two channels: parent -> child "cancel", child -> parent "done".
    let (cancel_tx, cancel_rx) = mpsc::channel::<()>();
    let (done_tx, done_rx) = mpsc::channel::<()>();

    let handle = thread::spawn(move || {
        let _guard = guard;
        // Interruptible wait. thread::sleep(duration) could not be woken up.
        let status = match cancel_rx.recv_timeout(duration) {
            Ok(()) => Status::Cancelled,
            Err(RecvTimeoutError::Timeout) => Status::Completed,
            // Every Sender was dropped: the parent is gone, so stop as if cancelled.
            // This returns IMMEDIATELY, which is why the parent keeps `cancel_tx` alive.
            Err(RecvTimeoutError::Disconnected) => Status::Cancelled,
        };
        // Ignore a send error: it only means the parent stopped listening.
        let _ = done_tx.send(());
        status // handed to the parent through join()
    });

    // JoinHandle has no join-with-timeout, so wait on the "done" channel instead.
    match done_rx.recv_timeout(timeout) {
        Ok(()) => {}
        Err(RecvTimeoutError::Timeout) => {
            // Cooperative cancellation: ask the thread to stop. Rust cannot kill a thread.
            // A send error means the child already finished in the meantime: fine.
            let _ = cancel_tx.send(());
        }
        // The child dropped `done_tx` without sending: it panicked. join() reports it.
        Err(RecvTimeoutError::Disconnected) => {}
    }

    // Never return while the child is running. join() consumes the handle,
    // so the type system rules out joining twice or forgetting the result.
    let status = handle.join().expect("child thread panicked");
    drop(cancel_tx); // kept alive until here on purpose (see the Disconnected arm above)

    Outcome {
        status,
        elapsed: start.elapsed(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn child_has_exited_after_return() {
        let guard = Arc::new(());
        let outcome = run(
            Duration::from_millis(1500),
            Duration::from_millis(300),
            Arc::clone(&guard),
        );
        assert_eq!(outcome.status, Status::Cancelled);
        // Only our clone is left: the child's closure (and its clone) has been dropped.
        assert_eq!(Arc::strong_count(&guard), 1);
    }

    #[test]
    fn dropping_the_sender_wakes_recv_timeout_immediately() {
        // The pitfall noted in the README: no message is sent, yet the wait ends at once.
        let (tx, rx) = mpsc::channel::<()>();
        drop(tx);
        let start = Instant::now();
        assert_eq!(
            rx.recv_timeout(Duration::from_secs(5)),
            Err(RecvTimeoutError::Disconnected)
        );
        assert!(start.elapsed() < Duration::from_millis(100));
    }
}
