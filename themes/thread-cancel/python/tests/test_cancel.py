import json
import threading
from pathlib import Path
from typing import Any

import pytest

from thread_cancel import CHILD_THREAD_NAME, pick_duration, run_with_timeout

CASES: list[dict[str, Any]] = json.loads((Path(__file__).parents[2] / "cases.json").read_text())


def cases(op: str) -> list[Any]:
    return [pytest.param(c, id=c["name"]) for c in CASES if c["op"] == op]


@pytest.mark.parametrize("case", cases("run"))
def test_run(case: dict[str, Any]) -> None:
    outcome = run_with_timeout(case["duration_ms"], case["timeout_ms"])
    assert outcome.status == case["expected_status"]
    assert abs(outcome.elapsed_ms - case["expected_elapsed_ms"]) <= case["tolerance_ms"]


@pytest.mark.parametrize("case", cases("pick"))
def test_pick(case: dict[str, Any]) -> None:
    assert case["min"] <= pick_duration(case["seed"]) <= case["max"]


@pytest.mark.parametrize("case", cases("pick-repeat"))
def test_pick_repeat(case: dict[str, Any]) -> None:
    assert pick_duration(case["seed"]) == pick_duration(case["seed"])


@pytest.mark.parametrize("case", cases("pick-range"))
def test_pick_range(case: dict[str, Any]) -> None:
    values = [pick_duration(s) for s in range(case["seed_from"], case["seed_to"] + 1)]
    assert all(case["min"] <= v <= case["max"] for v in values)


def test_pick_hits_both_ends() -> None:
    # randint is inclusive on both ends, so 1000 and 5000 should both appear.
    # 1000 seeds are not enough to see a given value out of 4001 (~22%), so scan more.
    values = {pick_duration(s) for s in range(100_000)}
    assert 1000 in values
    assert 5000 in values


def test_child_has_exited_after_return() -> None:
    run_with_timeout(1500, 300)  # cancelled path: the parent must still join
    assert not any(t.name == CHILD_THREAD_NAME for t in threading.enumerate())
