#!/usr/bin/env bash
# Create a Hugo comment post from a Douban link.
#
# Usage:
#   ./scripts/new-comment.sh <douban-url> [status]
#
# Examples:
#   ./scripts/new-comment.sh https://movie.douban.com/subject/1292214/
#   ./scripts/new-comment.sh https://movie.douban.com/subject/1292214/ watched
#   ./scripts/new-comment.sh https://music.douban.com/subject/1234567/ wishlist
#
# status: watched | wishlist (movie) / listened | wishlist (music)
#         default: wishlist

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COMMENT_DIR="$ROOT/content/comment"

usage() {
  sed -n '2,12p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

if [[ $# -lt 1 ]] || [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
  usage 0
fi

URL="$1"
STATUS="${2:-wishlist}"

if [[ ! "$URL" =~ ^https?://(movie|music)\.douban\.com/subject/[0-9]+/?$ ]]; then
  echo "error: expected a Douban movie/music URL" >&2
  echo "  e.g. https://movie.douban.com/subject/1292214/" >&2
  exit 1
fi

URL="${URL%/}/"

if ! command -v python3 >/dev/null 2>&1; then
  echo "error: python3 is required" >&2
  exit 1
fi

META="$(python3 - "$URL" "$STATUS" <<'PY'
import json
import re
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

url = sys.argv[1]
status = sys.argv[2]

subject_match = re.search(r"/subject/(\d+)/?", url)
subject_id = subject_match.group(1) if subject_match else "unknown"


def fetch_json(target: str) -> dict:
    req = urllib.request.Request(target, headers={"User-Agent": "wesleyel.github.io/new-comment"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.load(resp)


def pick_title(data: dict) -> str:
    for item in data.get("localized_title") or []:
        if item.get("lang") in ("zh-cn", "zh", "zh-hans") and item.get("text"):
            return item["text"].strip()
    for key in ("display_title", "title", "orig_title"):
        value = data.get(key)
        if value:
            return str(value).strip()
    return f"douban-{subject_id}"


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or f"douban-{subject_id}"


def resolve_item(url: str) -> dict:
    fetch_url = "https://neodb.social/api/catalog/fetch?url=" + urllib.parse.quote(url, safe="")
    meta = fetch_json(fetch_url)

    if meta.get("display_title") or meta.get("title"):
        return meta

    api_path = meta.get("api_url")
    if not api_path:
        path = meta.get("url", "")
        if path.startswith("/movie/") or path.startswith("/music/"):
            api_path = "/api" + path
        elif path.startswith("/api/"):
            api_path = path

    if not api_path:
        raise ValueError("catalog fetch returned no item reference")

    return fetch_json("https://neodb.social" + api_path)


try:
    data = resolve_item(url)
except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
    print(f"error: failed to fetch metadata: {exc}", file=sys.stderr)
    sys.exit(1)

title = pick_title(data)
slug = slugify(data.get("orig_title") or title)
category = (data.get("category") or data.get("type") or "").lower()
comment_type = "music" if "music" in category else "movie"

valid = {
    "movie": {"watched", "wishlist"},
    "music": {"listened", "wishlist"},
}
if status not in valid[comment_type]:
    if comment_type == "music" and status == "watched":
        status = "listened"
    else:
        print(
            f"error: invalid status '{status}' for {comment_type}; "
            f"use {'/'.join(sorted(valid[comment_type]))}",
            file=sys.stderr,
        )
        sys.exit(1)

print(json.dumps({
    "title": title,
    "slug": slug,
    "commentType": comment_type,
    "status": status,
}, ensure_ascii=False))
PY
)"

TITLE="$(printf '%s' "$META" | python3 -c 'import json,sys; print(json.load(sys.stdin)["title"])')"
SLUG="$(printf '%s' "$META" | python3 -c 'import json,sys; print(json.load(sys.stdin)["slug"])')"
COMMENT_TYPE="$(printf '%s' "$META" | python3 -c 'import json,sys; print(json.load(sys.stdin)["commentType"])')"
NORMALIZED_STATUS="$(printf '%s' "$META" | python3 -c 'import json,sys; print(json.load(sys.stdin)["status"])')"

FILE="$COMMENT_DIR/$SLUG.md"

if [[ -f "$FILE" ]]; then
  echo "error: already exists: $FILE" >&2
  exit 1
fi

if find "$COMMENT_DIR" -maxdepth 1 -name '*.md' ! -name '_index.md' -print0 2>/dev/null \
  | xargs -0 grep -lF "$URL" 2>/dev/null; then
  echo "error: a comment with this douban URL already exists" >&2
  exit 1
fi

TODAY="$(date +%Y-%m-%d)"

cat >"$FILE" <<EOF
---
title: $TITLE
date: $TODAY
commentType: $COMMENT_TYPE
douban: "$URL"
status: $NORMALIZED_STATUS
comments: true
slug: $SLUG
---

EOF

echo "Created: $FILE"
echo "  title:  $TITLE"
echo "  type:   $COMMENT_TYPE"
echo "  status: $NORMALIZED_STATUS"

if [[ -n "${EDITOR:-}" ]]; then
  "$EDITOR" "$FILE"
elif command -v code >/dev/null 2>&1; then
  code "$FILE"
fi
