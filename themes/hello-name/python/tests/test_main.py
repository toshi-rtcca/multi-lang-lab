import subprocess
import sys


def test_with_name():
    result = subprocess.run(
        [sys.executable, "-m", "hello_name.main", "--name=World"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0
    assert result.stdout == "Hello, World!\n"


def test_without_name():
    result = subprocess.run(
        [sys.executable, "-m", "hello_name.main"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 1
    assert result.stderr == "Sorry, may I have your name?\n"
