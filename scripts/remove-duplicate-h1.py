#!/usr/bin/env python3
"""Remove the first h1 heading from post/page/comment markdown (duplicates front matter title)."""

from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

FRONT_MATTER = re.compile(r"\A---\n.*?\n---\n", re.DOTALL)
H1_PATTERN = re.compile(r"^#(?!\#)\s+\S")

CONTENT_SECTIONS = frozenset({"post", "page", "comment"})


def should_process(path: Path, root: Path) -> bool:
    if path.suffix.lower() != ".md":
        return False
    try:
        rel = path.relative_to(root)
    except ValueError:
        return False
    parts = rel.parts
    return len(parts) >= 3 and parts[0] == "content" and parts[1] in CONTENT_SECTIONS


def remove_first_h1(text: str) -> str:
    match = FRONT_MATTER.match(text)
    if not match:
        return text

    front_matter = match.group(0)
    body = text[len(front_matter) :]

    lines = body.splitlines(keepends=True)
    in_code = False
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if stripped.startswith("```"):
            in_code = not in_code
            i += 1
            continue
        if in_code:
            i += 1
            continue
        if not stripped:
            i += 1
            continue
        if H1_PATTERN.match(line.rstrip("\r\n")):
            del lines[i]
            if i < len(lines) and not lines[i].strip():
                del lines[i]
        break

    return front_matter + "".join(lines)


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
        if path.is_file() and should_process(path, root):
            files.append(path)
    return files


def process_file(path: Path, root: Path, restage: bool) -> bool:
    original = path.read_text(encoding="utf-8")
    fixed = remove_first_h1(original)
    if fixed == original:
        return False

    path.write_text(fixed, encoding="utf-8")
    if restage:
        subprocess.run(["git", "add", str(path)], check=True)
    print(f"remove-duplicate-h1: {path.relative_to(root)}")
    return True


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--staged",
        action="store_true",
        help="Fix staged markdown files and re-add them to the index.",
    )
    parser.add_argument(
        "paths",
        nargs="*",
        help="Files to fix. Implies --staged is off unless only --staged is used.",
    )
    args = parser.parse_args()

    root = Path(
        subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip()
    )

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
        if not path.is_file() or not should_process(path, root):
            continue
        if process_file(path, root, restage):
            changed += 1

    if changed:
        print(f"remove-duplicate-h1: updated {changed} file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
