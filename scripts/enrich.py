#!/usr/bin/env python3
"""
enrich.py — Crawl TikTok avatar + video thumbnail, output enriched_summary.json
Usage: python enrich.py ../data/summary.json
"""

import json
import os
import re
import sys
import time

import requests

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/125.0.0.0 Safari/537.36"
)
HEADERS = {"User-Agent": UA}
MAX_RETRIES = 2
BACKOFF = 5
SLEEP = 1


def unescape_url(url: str) -> str:
    """Unescape unicode escapes like \\u002F → /"""
    if not url:
        return url
    try:
        return url.encode().decode("unicode_escape")
    except Exception:
        return url.replace("\\u002F", "/").replace("\\u0026", "&")


def fetch_with_retry(url: str, retries: int = MAX_RETRIES) -> requests.Response | None:
    for attempt in range(retries + 1):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            if resp.status_code == 200:
                return resp
            if resp.status_code in (403, 429) and attempt < retries:
                print(f"  [WARN] {resp.status_code} for {url}, retrying in {BACKOFF}s...")
                time.sleep(BACKOFF)
                continue
            print(f"  [WARN] HTTP {resp.status_code} for {url}")
            return None
        except requests.RequestException as e:
            if attempt < retries:
                print(f"  [WARN] {e}, retrying in {BACKOFF}s...")
                time.sleep(BACKOFF)
            else:
                print(f"  [ERROR] {e}")
                return None
    return None


def extract_avatar(html: str) -> str | None:
    """Extract avatar URL from TikTok profile HTML."""
    # Priority 1: og:image
    m = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']', html)
    if m:
        return unescape_url(m.group(1))

    # Priority 2: avatarMedium in embedded JSON
    m = re.search(r'"avatarMedium"\s*:\s*"(https?://[^"]+)"', html)
    if m:
        return unescape_url(m.group(1))

    # Priority 3: twitter:image
    m = re.search(r'<meta\s+name=["\']twitter:image["\']\s+content=["\']([^"\']+)["\']', html)
    if m:
        return unescape_url(m.group(1))

    return None


def fetch_avatar(profile_url: str) -> str | None:
    resp = fetch_with_retry(profile_url)
    if resp is None:
        return None
    return extract_avatar(resp.text)


def fetch_oembed(video_url: str) -> dict | None:
    oembed_url = f"https://www.tiktok.com/oembed?url={video_url}&format=json"
    resp = fetch_with_retry(oembed_url)
    if resp is None:
        return None
    try:
        return resp.json()
    except (json.JSONDecodeError, ValueError):
        return None


def enrich(input_path: str):
    with open(input_path, "r", encoding="utf-8") as f:
        creators = json.load(f)

    total_creators = len(creators)
    total_videos = sum(len(c.get("videos", [])) for c in creators)
    print(f"Enriching {total_creators} creators, {total_videos} videos...\n")

    for ci, creator in enumerate(creators, 1):
        username = creator.get("username", "unknown")
        profile_url = creator.get("url", "")
        print(f"[{ci}/{total_creators}] @{username}")

        # Fetch avatar
        avatar = fetch_avatar(profile_url) if profile_url else None
        if avatar:
            print(f"  Avatar: OK")
        else:
            print(f"  Avatar: not found (will use placeholder)")
        creator.setdefault("profile", {})["avatar_url"] = avatar
        time.sleep(SLEEP)

        # Fetch video thumbnails via oEmbed
        videos = creator.get("videos", [])
        for vi, video in enumerate(videos, 1):
            video_url = video.get("url", "")
            if not video_url:
                video["thumbnail_url"] = None
                video["thumbnail_width"] = None
                video["thumbnail_height"] = None
                continue

            oembed = fetch_oembed(video_url)
            if oembed:
                video["thumbnail_url"] = oembed.get("thumbnail_url")
                video["thumbnail_width"] = oembed.get("thumbnail_width")
                video["thumbnail_height"] = oembed.get("thumbnail_height")
                # Fill empty description from oembed title
                if not video.get("description") and oembed.get("title"):
                    video["description"] = oembed["title"]
                print(f"  Video {vi}/{len(videos)}: thumbnail OK")
            else:
                video["thumbnail_url"] = None
                video["thumbnail_width"] = None
                video["thumbnail_height"] = None
                print(f"  Video {vi}/{len(videos)}: thumbnail FAIL")
            time.sleep(SLEEP)

    # Write output
    output_dir = os.path.dirname(input_path)
    output_path = os.path.join(output_dir, "enriched_summary.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(creators, f, ensure_ascii=False, indent=2)

    print(f"\nDone! Output: {output_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python enrich.py <path-to-summary.json>")
        sys.exit(1)
    enrich(sys.argv[1])
