"""Regression guard: the staging scaffold must not start in production mode."""
import os
import subprocess
import sys


def test_production_mode_fails_closed():
    env = os.environ.copy()
    env["MUKUL_ENV"] = "production"
    env.pop("DATABASE_URL", None)
    result = subprocess.run(
        [sys.executable, "-c", "import app.main"],
        cwd=os.path.dirname(os.path.dirname(__file__)),
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    assert result.returncode != 0
    assert "production mode is disabled" in result.stderr.lower()
