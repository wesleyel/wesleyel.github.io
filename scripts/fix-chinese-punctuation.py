#!/usr/bin/env python3
"""Convert half-width punctuation to full-width when it follows Chinese text."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

CHINESE = r"[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]"
PUNCT_PATTERN = re.compile(rf"({CHINESE})([.,?;])")
PUNCT_MAP = {
    ".": "。",
    ",": "，",
    "?": "？",
    ";": "；",
}

TEXT_EXTENSIONS = {
    ".md",
    ".html",
    ".htm",
    ".txt",
    ".yaml",
    ".yml",
    ".toml",
}


def fix_text(text: str) -> str:
    return PUNCT_PATTERN.sub(lambda m: m.group(1) + PUNCT_MAP[m.group(2)], text)


def should_process(path: Path) -> bool:
    return path.suffix.lower() in TEXT_EXTENSIONS


def get_staged_files(root: Path) -> list[Path]:
    result = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM", "-z"],
        cwd=root,
        capture_output=True,
        check=True,
    )
    files: list[Path] = []
    for raw in result.stdout.split(b"\0"):
        if not raw:
            continue
        path = root / raw.decode("utf-8")
        if path.is_file() and should_process(path):
            files.append(path)
    return files


def process_file(path: Path, restage: bool) -> bool:
    original = path.read_text(encoding="utf-8")
    fixed = fix_text(original)
    if fixed == original:
        return False

    path.write_text(fixed, encoding="utf-8")
    if restage:
        subprocess.run(["git", "add", str(path)], check=True)
    print(f"fix-chinese-punctuation: {path}")
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--staged",
        action="store_true",
        help="Fix staged text files and re-add them to the index.",
    )
    parser.add_argument(
        "paths",
        nargs="*",
        help="Files to fix. Implies --staged is off unless only --staged is used.",
    )
    args = parser.parse_args()

    root = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip())

    if args.paths:
        targets = [Path(p) if Path(p).is_absolute() else root / p for p in args.paths]
        restage = False
    elif args.staged:
        targets = get_staged_files(root)
        restage = True
    else:
        parser.error("pass --staged or one or more file paths")

    changed = 0
    for path in targets:
        if not path.is_file() or not should_process(path):
            continue
        if process_file(path, restage):
            changed += 1

    if changed:
        print(f"fix-chinese-punctuation: updated {changed} file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
