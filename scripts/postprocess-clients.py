#!/usr/bin/env python3
"""Trim generated-client noise after openapi-generator runs.

Called by `bun run typesync` after both generator invocations. Keeps the
generated trees down to code only (no docs/, git_push.sh, .npmignore).
"""

import shutil
from pathlib import Path

TS_DIR = Path("src/api")
NOISE = ("docs", "git_push.sh", ".npmignore")


def trim(directory: Path) -> None:
    for name in NOISE:
        path = directory / name
        if path.is_dir():
            shutil.rmtree(path)
        elif path.exists():
            path.unlink()


if __name__ == "__main__":
    if TS_DIR.exists():
        trim(TS_DIR)
    print("generated clients trimmed")
