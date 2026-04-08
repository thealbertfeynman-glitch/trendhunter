# CLAUDE.md — TrendHunter: TikTok Trend Finder SaaS

> Đây là file hướng dẫn cho Claude Code. Đặt file này ở root folder dự án.
> Claude Code sẽ đọc file này và tự build toàn bộ project.

---

## 🎯 Mục tiêu dự án

Build một SaaS web app tên **TrendHunter** gồm 2 phần:

1. **Backend script (Python)**: Đọc file `summary.json` (dữ liệu TikTok đã crawl), enrich thêm avatar + video thumbnail, phân tích trend theo hashtag, output ra `enriched_summary.json`.
2. **Frontend dashboard (Next.js 14 + Tailwind)**: Hiển thị creators, videos với ảnh thật (avatar, thumbnail), trend analysis, search/filter/sort.

---

## 📁 Cấu trúc thư mục

```
trendhunter/
├── CLAUDE.md                    ← File này
├── data/
│   ├── summary.json             ← Input gốc (user tự copy vào)
│   └── enriched_summary.json    ← Output sau khi chạy enrich script
├── scripts/
│   ├── enrich.py                ← Script crawl avatar + thumbnail
│   ├── analyze_trends.py        ← Script phân tích trend
│   └── requirements.txt         ← Python dependencies
├── app/                         ← Next.js 14 App Router
│   ├── layout.tsx
│   ├── page.tsx                 ← Trang chính — dashboard
│   ├── globals.css
│   ├── api/
│   │   ├── creators/route.ts    ← API đọc enriched data
│   │   └── trends/route.ts      ← API trả trend analysis
│   └── components/
│       ├── CreatorCard.tsx
│       ├── VideoCard.tsx
│       ├── TrendBoard.tsx
│       ├── SearchBar.tsx
│       ├── StatsBar.tsx
│       └── HashtagBadge.tsx
├── public/
│   └── placeholder-avatar.svg   ← Fallback avatar
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

---

## 📊 Schema dữ liệu

### Input: `summary.json`

```json
[
  {
    "username": "asigtsijov",
    "url": "https://www.tiktok.com/@asigtsijov",
    "profile": {
      "nickname": "asigtsijov",
      "bio": "No bio yet.",
      "followers": "17.1K",       // string — cần parse
      "following": "3",
      "likes": "69K"              // string — cần parse
    },
    "videosCount": 16,
    "videos": [
      {
        "url": "https://www.tiktok.com/@asigtsijov/video/7624468553797799199",
        "description": "Cómo hacer un video C-Walk...",
        "hashtags": ["#cwalk", "#cwalkdance", "#dance", "#capcut", "#capcutpioneer"],
        "views": "3139",          // string — cần parse
        "likes": "45",
        "comments": "1",
        "shares": "35",
        "saves": "8",
        "music": "",
        "postedAt": "2026-04-03T09:53:03.000Z",   // ISO string hoặc null
        "dateSource": "timestamp:1775209983",
        "dateText": "· 21h ago",
        "isPinned": false
      }
    ],
    "crawledAt": "2026-04-04T..."
  }
]
```

### Output: `enriched_summary.json` (bổ sung thêm)

Mỗi creator thêm:
```json
{
  "profile": {
    "avatar_url": "https://p16-sign-sg.tiktokcdn.com/..."  // hoặc null
  }
}
```

Mỗi video thêm:
```json
{
  "thumbnail_url": "https://p16-sign-sg.tiktokcdn.com/...",  // hoặc null
  "thumbnail_width": 576,
  "thumbnail_height": 1024
}
```

---

## 🔧 PHẦN 1: Python Scripts

### 1.1 `scripts/requirements.txt`

```
requests>=2.31.0
```

### 1.2 `scripts/enrich.py` — Crawl avatar + thumbnail

**Logic chi tiết:**

```
FOR mỗi creator trong summary.json:
    1. GET creator.url (trang profile TikTok)
       → Parse HTML tìm avatar URL bằng regex:
         - Ưu tiên 1: <meta property="og:image" content="...">
         - Ưu tiên 2: regex "avatarMedium":"(https://...)" trong embedded JSON
         - Ưu tiên 3: <meta name="twitter:image" content="...">
       → Lưu vào creator.profile.avatar_url
       → Sleep 1s (tránh rate limit)

    2. FOR mỗi video trong creator.videos:
       → GET https://www.tiktok.com/oembed?url={video.url}&format=json
       → Response JSON chứa:
           - thumbnail_url: URL ảnh thumbnail
           - thumbnail_width, thumbnail_height
           - title (có thể bổ sung vào description nếu trống)
       → Lưu vào video.thumbnail_url, video.thumbnail_width, video.thumbnail_height
       → Sleep 1s

OUTPUT → data/enriched_summary.json
```

**Xử lý edge cases:**
- TikTok trả 403/429 → retry 2 lần, backoff 5s
- Avatar không tìm được → set null, frontend dùng placeholder (initial-based)
- oEmbed fail → set thumbnail_url = null, frontend dùng gradient placeholder
- URL trong HTML có thể bị escape (`\u002F` thay `/`) → unescape trước khi lưu
- Một số video cũ không có oEmbed → skip gracefully

**User-Agent:** Dùng Chrome User-Agent thật để tránh bị block:
```
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36
```

**CLI usage:**
```bash
cd scripts
pip install -r requirements.txt
python enrich.py ../data/summary.json
# Output: ../data/enriched_summary.json
```

### 1.3 `scripts/analyze_trends.py` — Phân tích trend

**Logic chi tiết:**

```
1. Đọc enriched_summary.json (hoặc summary.json nếu chưa enrich)

2. Gom tất cả hashtag từ mọi video trong 7 ngày gần nhất:
   hashtag_map = {
     "#cwalk": {
       creators: Set["asigtsijov", "user473..."],
       videos: [{ url, views, postedAt, creator }],
       total_views: 28000,
       avg_views: 4000,
     }
   }

3. Tính Trend Score cho mỗi hashtag:
   - creator_count = len(unique creators dùng hashtag này)
   - total_views = sum views (parse string "17K" → 17000)
   - freshness = weighted average: video mới → weight cao hơn
     - decay_factor = exp(-0.3 * days_ago)  // video hôm nay = 1.0, 3 ngày trước = 0.41
   - trend_score = creator_count × log10(total_views + 1) × freshness

4. Filter: chỉ giữ hashtag có ≥ 2 unique creators

5. Sort theo trend_score giảm dần

6. Output ra data/trend_analysis.json:
{
  "generated_at": "2026-04-04T...",
  "analysis_period": "2026-03-28 to 2026-04-04",
  "total_creators": 7,
  "total_videos": 41,
  "trends": [
    {
      "rank": 1,
      "hashtag": "#capcut",
      "trend_score": 95.2,
      "creator_count": 5,
      "video_count": 30,
      "total_views": 150000,
      "freshness": 0.85,
      "sample_videos": [
        { "url": "...", "creator": "@dreamweaver.pl", "views": 45200, "posted": "2026-04-02" }
      ]
    }
  ]
}
```

**Parse view count helper** (QUAN TRỌNG — dùng chung cho cả frontend):
```python
def parse_views(s: str) -> int:
    s = s.strip().replace(",", "")
    if s.endswith("M"):
        return int(float(s[:-1]) * 1_000_000)
    elif s.endswith("K"):
        return int(float(s[:-1]) * 1_000)
    else:
        return int(float(s)) if s else 0
```

**CLI usage:**
```bash
python analyze_trends.py ../data/enriched_summary.json
# Output: ../data/trend_analysis.json
```

---

## 🎨 PHẦN 2: Frontend (Next.js 14)

### 2.1 Setup

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

### 2.2 Design Direction

**Aesthetic**: Dark, data-dense SaaS dashboard. Lấy cảm hứng từ Vercel Dashboard + Linear.
- Background: gradient tối `#0a0f1e → #0f172a → #1a1033`
- Cards: glassmorphism nhẹ `rgba(15,23,42,0.6)` + `backdrop-blur`
- Accent: indigo `#6366f1` cho interactive elements
- Hot accent: amber `#f59e0b` cho viral metrics
- Font: `DM Sans` (body) + `JetBrains Mono` (numbers/stats)
- Micro-animations: hover lift trên cards, smooth expand/collapse

**KHÔNG DÙNG**: Inter, Roboto, Arial. Không dùng purple gradient on white.

### 2.3 Fonts — thêm vào `app/layout.tsx`

```tsx
import { DM_Sans, JetBrains_Mono } from 'next/font/google'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
```

### 2.4 API Routes

#### `app/api/creators/route.ts`
- Đọc `data/enriched_summary.json` (fallback `data/summary.json`)
- Return toàn bộ creator list
- Hỗ trợ query params: `?sort=followers|views|videos&search=keyword`

#### `app/api/trends/route.ts`
- Đọc `data/trend_analysis.json`
- Return trend list
- Nếu file chưa có → tự generate on-the-fly bằng cùng logic analyze_trends.py

### 2.5 Trang chính — `app/page.tsx`

Layout tổng:
```
┌─────────────────────────────────────────────────┐
│  ⚡ TrendHunter          [LIVE badge]           │
│  TikTok Creator Intelligence • 04/04/2026       │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ 👥 7     │ │ 📹 41    │ │ 👁 7.2M  │        │
│  │ Creators │ │ Videos   │ │ Views    │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│  [Tab: Creators] [Tab: Trends]                  │
│                                                 │
│  ┌─ Search ──────────┐ [Followers▼] [Views]     │
│  └───────────────────┘                          │
│                                                 │
│  ┌─ Creator Card ────────────────────────────┐  │
│  │ [Avatar] @dreamweaver.pl  [TOP badge]     │  │
│  │          954.2K followers · 6.5M views     │  │
│  │ ▼ expand to see videos                    │  │
│  │  ┌ Video ──────────────────────────────┐  │  │
│  │  │ [Thumbnail] Description...          │  │  │
│  │  │             #hashtag #hashtag       │  │  │
│  │  │             🔥 45.2K views · 1d ago │  │  │
│  │  └────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌─ Creator Card ────────────────────────────┐  │
│  │ ...                                       │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 2.6 Components chi tiết

#### `CreatorCard.tsx`
- Props: `creator`, `isExpanded`, `onToggle`
- Avatar: nếu có `avatar_url` → `<img>` với `rounded-full` + ring border. Nếu null → initial-based avatar (2 chữ đầu username, gradient background dựa trên index)
- Stats row: followers, total views, video count — dùng `JetBrains Mono`
- Badge "TOP" nếu followers ≥ 100K (gradient amber→red)
- Click header → toggle expand/collapse (animated height)
- Expanded: list `VideoCard` + link "View on TikTok ↗"

#### `VideoCard.tsx`
- Props: `video`, `creatorUsername`
- Layout: `grid grid-cols-[80px_1fr_auto]`
  - Col 1: Thumbnail (80×106 aspect 3:4). Nếu `thumbnail_url` → `<img>` rounded. Nếu null → gradient placeholder với play icon ▶
  - Col 2: Description (1 dòng, ellipsis overflow), hashtag badges bên dưới
  - Col 3: View count (amber nếu ≥ 10K + 🔥), time ago
- Click → `window.open(video.url)` mở TikTok
- Pinned video → 📌 badge
- Hover: subtle border color change to indigo

#### `TrendBoard.tsx`
- Hiển thị khi user chọn tab "Trends"
- Đọc từ `/api/trends`
- Mỗi trend: rank badge (1,2,3 = gold/silver/bronze), hashtag lớn, trend score bar, creator count, sample video links
- Bar chart hoặc horizontal bars cho top 10 trends

#### `SearchBar.tsx`
- Input search (filter by creator name hoặc hashtag)
- Sort buttons: Followers / Views / Videos (toggle active state)

#### `StatsBar.tsx`
- 3 stat cards: Total Creators, Total Videos, Total Views
- Mỗi card: icon + value (lớn, mono font) + label

#### `HashtagBadge.tsx`
- Inline badge với background indigo tối + text indigo sáng
- `px-2 py-0.5 rounded text-xs font-semibold`

### 2.7 Utility function — `lib/parse.ts`

```typescript
// Parse "17.1K" → 17100, "6.5M" → 6500000, "3139" → 3139
export function parseMetric(s: string): number {
  if (!s) return 0;
  const clean = s.replace(/,/g, '').trim();
  if (clean.endsWith('M')) return Math.round(parseFloat(clean) * 1_000_000);
  if (clean.endsWith('K')) return Math.round(parseFloat(clean) * 1_000);
  return Math.round(parseFloat(clean)) || 0;
}

// Format 17100 → "17.1K"
export function formatMetric(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

// "2026-04-03T09:53:03.000Z" → "21h ago"
export function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
```

### 2.8 Responsive

- Desktop: max-width 900px centered
- Mobile: single column, cards full width, thumbnail ẩn trên màn hình nhỏ (<640px)
- Collapse all cards by default trên mobile

---

## 🚀 PHẦN 3: Chạy toàn bộ

### Bước 1: Setup project
```bash
mkdir trendhunter && cd trendhunter
# Copy summary.json vào data/summary.json
mkdir -p data scripts
cp /path/to/summary.json data/
```

### Bước 2: Chạy enrich script
```bash
cd scripts
pip install -r requirements.txt
python enrich.py ../data/summary.json
# → Output: ../data/enriched_summary.json
```

### Bước 3: Chạy trend analysis
```bash
python analyze_trends.py ../data/enriched_summary.json
# → Output: ../data/trend_analysis.json
```

### Bước 4: Chạy frontend
```bash
cd ..
npm install
npm run dev
# → http://localhost:3000
```

---

## ⚠️ Lưu ý quan trọng cho Claude Code

1. **Đọc file CLAUDE.md này trước khi code bất kỳ thứ gì.**

2. **Thứ tự build**: Python scripts trước → test chạy enrich → test analyze → rồi mới build frontend.

3. **Dữ liệu input là `data/summary.json`** — file này user tự copy vào. KHÔNG hardcode data vào frontend. Frontend đọc qua API route.

4. **Parse metric strings**: Views, followers, likes trong JSON đều là STRING dạng "17.1K", "6.5M", "3139". Cần parse thành number ở cả Python lẫn TypeScript.

5. **Avatar/thumbnail có thể null**: Luôn có fallback UI. Không crash nếu thiếu ảnh.

6. **TikTok rate limit**: Script enrich phải sleep ≥1s giữa mỗi request. Có retry logic.

7. **Không dùng database**: Mọi thứ đọc/ghi JSON file. Đơn giản cho hackathon.

8. **Không cần auth**: Không có login, không có user system. Public dashboard.

9. **oEmbed API không cần API key**: `GET https://www.tiktok.com/oembed?url={video_url}&format=json` là public endpoint.

10. **Nếu enrich chưa chạy** (chưa có `enriched_summary.json`), frontend phải fallback đọc `summary.json` gốc và dùng placeholder cho avatar/thumbnail.

---

## 📋 Checklist hoàn thành

- [ ] `scripts/enrich.py` chạy được, output `enriched_summary.json` với avatar_url + thumbnail_url
- [ ] `scripts/analyze_trends.py` chạy được, output `trend_analysis.json` với ranked hashtags
- [ ] Frontend hiển thị creator cards với avatar (ảnh thật hoặc placeholder)
- [ ] Frontend hiển thị video cards với thumbnail (ảnh thật hoặc placeholder)
- [ ] Click video → mở TikTok trong tab mới
- [ ] Click creator → mở TikTok profile trong tab mới
- [ ] Search filter hoạt động (by username, hashtag)
- [ ] Sort hoạt động (followers, views, video count)
- [ ] Tab Trends hiển thị top hashtags với trend score
- [ ] Responsive trên mobile
- [ ] Không crash khi data thiếu fields (null handling)
