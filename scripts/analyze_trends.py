#!/usr/bin/env python3
"""
analyze_trends.py — Analyze hashtag trends from TikTok data
Usage: python analyze_trends.py ../data/enriched_summary.json
"""

import json
import math
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone


def parse_views(s: str) -> int:
    if not s:
        return 0
    s = s.strip().replace(",", "")
    if s.endswith("M"):
        return int(float(s[:-1]) * 1_000_000)
    elif s.endswith("K"):
        return int(float(s[:-1]) * 1_000)
    else:
        try:
            return int(float(s))
        except ValueError:
            return 0


def analyze(input_path: str):
    with open(input_path, "r", encoding="utf-8") as f:
        creators = json.load(f)

    now = datetime.now(timezone.utc)

    # Gather all hashtag data
    hashtag_map = defaultdict(lambda: {
        "creators": set(),
        "videos": [],
        "total_views": 0,
    })

    total_creators = len(creators)
    total_videos = 0

    for creator in creators:
        username = creator.get("username", "unknown")
        for video in creator.get("videos", []):
            total_videos += 1
            views = parse_views(str(video.get("views", "0")))
            posted_at = video.get("postedAt")

            # Calculate days ago
            days_ago = 999
            if posted_at:
                try:
                    posted_dt = datetime.fromisoformat(posted_at.replace("Z", "+00:00"))
                    days_ago = (now - posted_dt).total_seconds() / 86400
                except (ValueError, TypeError):
                    days_ago = 999

            hashtags = video.get("hashtags", [])
            for tag in hashtags:
                tag_lower = tag.lower() if not tag.startswith("#") else tag.lower()
                if not tag_lower.startswith("#"):
                    tag_lower = f"#{tag_lower}"

                hashtag_map[tag_lower]["creators"].add(username)
                hashtag_map[tag_lower]["videos"].append({
                    "url": video.get("url", ""),
                    "creator": f"@{username}",
                    "views": views,
                    "posted": posted_at[:10] if posted_at else None,
                    "days_ago": days_ago,
                })
                hashtag_map[tag_lower]["total_views"] += views

    # Calculate trend scores
    trends = []
    for hashtag, data in hashtag_map.items():
        creator_count = len(data["creators"])

        # Filter: need at least 2 creators
        if creator_count < 2:
            continue

        total_views = data["total_views"]
        video_count = len(data["videos"])

        # Freshness: weighted average using exponential decay
        if data["videos"]:
            weighted_sum = 0
            weight_total = 0
            for v in data["videos"]:
                decay = math.exp(-0.3 * v["days_ago"]) if v["days_ago"] < 999 else 0.01
                weighted_sum += decay * v["views"]
                weight_total += v["views"] if v["views"] > 0 else 1
            freshness = weighted_sum / weight_total if weight_total > 0 else 0.01
        else:
            freshness = 0.01

        # Trend score
        trend_score = round(creator_count * math.log10(total_views + 1) * freshness, 1)

        # Sort sample videos by views descending, take top 3
        sample_videos = sorted(data["videos"], key=lambda v: v["views"], reverse=True)[:3]
        for sv in sample_videos:
            sv.pop("days_ago", None)

        trends.append({
            "hashtag": hashtag,
            "trend_score": trend_score,
            "creator_count": creator_count,
            "video_count": video_count,
            "total_views": total_views,
            "freshness": round(freshness, 3),
            "sample_videos": sample_videos,
        })

    # Sort by trend_score descending
    trends.sort(key=lambda t: t["trend_score"], reverse=True)

    # Add rank
    for i, trend in enumerate(trends, 1):
        trend["rank"] = i

    # Determine analysis period
    all_dates = []
    for creator in creators:
        for video in creator.get("videos", []):
            if video.get("postedAt"):
                try:
                    all_dates.append(video["postedAt"][:10])
                except Exception:
                    pass

    min_date = min(all_dates) if all_dates else "unknown"
    max_date = max(all_dates) if all_dates else "unknown"

    output = {
        "generated_at": now.isoformat(),
        "analysis_period": f"{min_date} to {max_date}",
        "total_creators": total_creators,
        "total_videos": total_videos,
        "trends": trends,
    }

    output_dir = os.path.dirname(input_path)
    output_path = os.path.join(output_dir, "trend_analysis.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Trend Analysis Complete!")
    print(f"  Creators: {total_creators}")
    print(f"  Videos: {total_videos}")
    print(f"  Trends found (>=2 creators): {len(trends)}")
    print(f"  Top trends:")
    for t in trends[:5]:
        print(f"    #{t['rank']} {t['hashtag']} — score: {t['trend_score']}, "
              f"creators: {t['creator_count']}, views: {t['total_views']}")
    print(f"\nOutput: {output_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Default path
        default = os.path.join(os.path.dirname(__file__), "..", "data", "enriched_summary.json")
        if not os.path.exists(default):
            default = os.path.join(os.path.dirname(__file__), "..", "data", "summary.json")
        if os.path.exists(default):
            analyze(default)
        else:
            print("Usage: python analyze_trends.py <path-to-data.json>")
            sys.exit(1)
    else:
        analyze(sys.argv[1])
