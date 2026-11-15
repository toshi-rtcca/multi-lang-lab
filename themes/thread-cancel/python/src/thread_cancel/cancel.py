"""One child thread, a timeout, and cooperative cancellation (reference implementation)."""

import random
import threading
import time
from dataclasses import dataclass
from typing import Literal

Status = Literal["completed", "cancelled"]

MIN_DURATION_MS = 1000
MAX_DURATION_MS = 5000

# Named so tests can check the child is gone from threading.enumerate().
CHILD_THREAD_NAME = "thread-cancel-child"


@dataclass(frozen=True)
class Outcome:
    status: Status
    elapsed_ms: int


def pick_duration(seed: int) -> int:
    """Return a duration in ms within 1000..5000, both ends inclusive, deterministic per seed."""
    # A private Random instance: seeding the module-level generator would
    # change global state shared with every other caller.
    rng = random.Random(seed)
    # randint includes BOTH ends (unlike range() and randrange()).
    return rng.randint(MIN_DURATION_MS, MAX_DURATION_MS)


def run_with_timeout(duration_ms: int, timeout_ms: int = 3500) -> Outcome:
    """Run one child for duration_ms; cancel it cooperatively if it exceeds timeout_ms."""
    cancel = threading.Event()
    # The child writes its status here; the parent reads it only after join().
    result: list[Status] = []

    def child() -> None:
        # Interruptible wait: returns True as soon as cancel.set() is called,
        # False when the full duration passes. time.sleep() could not be woken up.
        signaled = cancel.wait(duration_ms / 1000)
        result.append("cancelled" if signaled else "completed")

    started = time.monotonic()
    thread = threading.Thread(target=child, name=CHILD_THREAD_NAME)
    thread.start()

    # join(timeout) returns None either way; is_alive() tells us whether it timed out.
    thread.join(timeout_ms / 1000)
    if thread.is_alive():
        # Cooperative cancellation: ask the child to stop. Python cannot kill a thread.
        cancel.set()
        thread.join()  # never return while the child is still running

    elapsed_ms = round((time.monotonic() - started) * 1000)
    return Outcome(status=result[0], elapsed_ms=elapsed_ms)
