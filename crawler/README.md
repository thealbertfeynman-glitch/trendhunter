# TrendHunter Crawler

> Puppeteer-based TikTok data collector for the TrendHunter intelligence platform.

Crawl video data from TikTok user profiles using Puppeteer with stealth mode. Automatically collects videos posted within the last N days along with detailed metadata including **product/shopping links**.

## Features

- Crawl multiple TikTok accounts from a configurable user list
- Collect videos from the last **5 days** (configurable via `DAYS_TO_CRAWL`)
- Detect and handle **pinned videos** (skip old pinned, don't count toward stop threshold)
- Stop early after 3 consecutive old non-pinned videos
- Collect **TikTok Shop product data** (name, price, image, link)
- Output directly compatible with TrendHunter dashboard

### Data Collected

**Profile info:**
| Field | Description |
|-------|-------------|
| `nickname` | Display name |
| `bio` | User bio |
| `followers` | Follower count |
| `following` | Following count |
| `likes` | Total likes on profile |
| `avatar` | Avatar image URL |

**Per video:**
| Field | Description |
|-------|-------------|
| `url` | Direct video link |
| `description` | Video caption/description |
| `hashtags` | List of hashtags |
| `thumbnail` | Video cover image URL |
| `products` | Shopping/product links attached to the video |
| `views` | View count |
| `likes` | Like count |
| `comments` | Comment count |
| `shares` | Share count |
| `saves` | Save/collect count |
| `music` | Sound/music name |
| `postedAt` | Post date (ISO 8601) |
| `isPinned` | Whether the video is pinned |

**Per product (if attached):**
| Field | Description |
|-------|-------------|
| `name` | Product name |
| `link` | Product/shop URL |
| `price` | Price (if available) |
| `image` | Product image URL |

## Prerequisites

- Node.js >= 18
- Chrome/Chromium (downloaded automatically by Puppeteer)

## Installation

```bash
cd crawler
npm install
```

## Configuration

### User List

Edit `users.json` with an array of TikTok usernames (without `@`):

```json
[
  "username1",
  "username2",
  "another.user"
]
```

### Constants

In `index.js`:

| Constant | Default | Description |
|----------|---------|-------------|
| `DAYS_TO_CRAWL` | `5` | Number of recent days to collect videos from |
| `OUTPUT_DIR` | `../data` | Output directory (feeds into TrendHunter dashboard) |
| `USERS_FILE` | `./users.json` | Path to user list file |

## Usage

```bash
npm start
# or
node index.js
```

The browser will launch in **visible mode** (not headless) to avoid TikTok bot detection.

## Output

Results are saved directly to `data/` for the TrendHunter dashboard:

```
data/
  summary.json        # Combined results — auto-loaded by dashboard
```

### Integration with TrendHunter

The crawler output is **directly compatible** with the TrendHunter dashboard:

1. Run the crawler → outputs `data/summary.json`
2. (Optional) Run `scripts/analyze_trends.py` → generates trend analysis
3. Start dashboard → `npm run dev` → auto-loads data

The dashboard auto-detects both old format (`avatar_url`, `thumbnail_url`) and new TrendHunter Crawler format (`avatar`, `thumbnail`, `products`).

## Tech Stack

- **[puppeteer](https://pptr.dev/)** — Browser automation
- **[puppeteer-extra](https://github.com/nicedream/puppeteer-extra)** — Plugin framework
- **[puppeteer-extra-plugin-stealth](https://github.com/nicedream/puppeteer-extra-plugin-stealth)** — Anti-detection
