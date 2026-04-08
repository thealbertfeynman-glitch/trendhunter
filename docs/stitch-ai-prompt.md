# Stitch AI Prompt — TrendHunter UX/UI Design

Use this prompt in Stitch AI to generate complete UX/UI designs for TrendHunter on both web and mobile.

---

## PROMPT

```
Design a complete UX/UI for "TrendHunter" — a data-driven SaaS dashboard for detecting TikTok trends. The product helps User Acquisition teams find emerging viral content before it peaks.

## Brand Identity

- Product name: TrendHunter
- Slogan: "#1 Trend Detection Agent"
- Logo concept: Radar Pulse — concentric radar circles with a sweep line, symbolizing signal detection
- Brand colors:
  - Primary background: #0B1326 (deep navy)
  - Surface: #131B2E (dark card surface)
  - Primary accent: #00E5FF (cyan — used for interactive elements, highlights, data)
  - Secondary accent: #6D11AD (purple — used for AI features, executive summary)
  - Tertiary: #C77DFF (light purple — AI badges, secondary text)
  - Amber: #F59E0B (hot/viral metrics, warnings)
  - Text primary: #DAE2FD (light blue-white)
  - Text secondary: #BAC9CC (muted gray)
- Typography:
  - Headlines: Space Grotesk (bold, modern, techy)
  - Body: Inter (clean, readable)
  - Data/numbers: JetBrains Mono (monospace for stats)
- Visual style: Dark, data-dense SaaS dashboard. Glassmorphism cards with subtle backdrop-blur. Inspired by Vercel Dashboard + Linear app.

## Design Requirements

### SCREEN 1: Loading / Scanning State (Web + Mobile)
- Full-screen centered animation
- Radar circle animation (concentric circles with a rotating sweep line)
- Small "blip" dots appearing on the radar
- Text: "Scanning TikTok Signals" with pulsing dots
- Subtext: "Analyzing creator data..."
- Dark background, cyan glow effects
- This transitions to the main dashboard after ~3 seconds

### SCREEN 2: Main Dashboard — Trend Explorer (Web)
Layout:
- Fixed left sidebar (w-64):
  - Logo (radar icon + "TrendHunter" text)
  - Slogan: "#1 TREND DETECTION AGENT" in uppercase tracking-widest
  - Nav items: "Trends Explorer" (active), "Creators"
  - Bottom: "DATA UPDATED 4/6/2026"
- Top header bar:
  - Logo on left, search bar center-right, user avatar right
- Main content area:
  - Stats bar: 4 cards in a row — "Active Creators" (48), "Total Videos" (751), "Total Views" (25.7M), "Platform" (TikTok)
  - Tab switcher: [Creators] [Trends] — inline pill buttons
  - Section title: "Trending Content Sparks"
  - AI Executive Summary card:
    - Purple gradient border, glass background
    - Header: brain/neurology icon + "AI Executive Summary" + "AI" badge (animated pulse)
    - Content: numbered insight points with typing animation cursor
    - Show 3 insights with "+N more insights" expand button
  - Tab bar: [Hashtags (31)] [Trend Groups (6)] with sort dropdown
  - Hashtag cards (list view, each card):
    - Rank badge (#1, #2, #3 with gold/silver/bronze colors)
    - Hashtag name large (e.g., "#dirtydancing")
    - Badges: "HOT" (red), "Rising" (green)
    - Stats row: views (with icon), creators count, video count, growth %
    - Score bar: gradient bar from cyan to purple
    - Right side: mini sparkline chart + TikTok link button + expand chevron
    - Expanded state: "VISUAL EVIDENCE" section with video thumbnail grid (small thumbnails in 6-column grid)

### SCREEN 3: Main Dashboard — Trend Explorer (Mobile, 375px)
- No sidebar (hidden, accessible via hamburger menu)
- Top header: hamburger + logo + search icon
- Stats: 2x2 grid cards
- Tab switcher: [Creators] [Trends] below stats
- AI Executive Summary: collapsed by default (show 3 lines + "Show more")
- Hashtag cards: compact padding, smaller text
- Bottom navigation bar: Creators | Trends (with icons)
- Video thumbnails: 2-column grid when expanded

### SCREEN 4: Trend Groups View (Web)
- Same layout as Trend Explorer but with "Trend Groups" tab active
- Each Trend Group card:
  - Colored icon in gradient circle (e.g., music note for "AI Dance Effects")
  - Group name + growth signal badge (HOT/Rising/Stable/Niche)
  - Description text
  - Stats: total views, video count, creator count, avg views/video
  - Related hashtags as small tags
  - Trend score number on right
  - Expanded state:
    - "Top Creators" row with avatar + username + views
    - "Top Videos" grid with small thumbnails
- Example trend groups to show:
  1. AI Dance Effects (music_note icon, pink-rose gradient)
  2. AI Photo Generation (camera icon, violet-purple gradient)
  3. AI Video Editing (movie_edit icon, cyan-teal gradient)
  4. AI Tools & Platforms (smart_toy icon, emerald-green gradient)
  5. AI Filters & Effects (auto_awesome icon, amber-orange gradient)

### SCREEN 5: Creators View (Web)
Layout:
- Left: Creator list with search + sort (by followers/views/videos)
- Right: Top Creators sidebar showing top 5 ranked by views
- Each creator row:
  - Avatar (circular, with ring border) or initial-based fallback (gradient background)
  - Username (@handle)
  - Follower count, total views, video count
  - "TOP" badge if followers >= 100K
- Click to expand: shows video list
  - Each video: thumbnail (small), description (truncated), hashtag badges, view count, time ago, "Watch on TikTok" link

### SCREEN 6: Creators View (Mobile)
- Full-width creator cards (no sidebar)
- Avatar + username + stats in compact layout
- Videos hidden by default, expand on tap
- Search bar at top

### SCREEN 7: Empty State / No Data
- Centered illustration: radar with no blips
- Text: "No trends detected yet"
- Subtext: "Run the crawler to start detecting trends"
- CTA button: "Start Scanning" (cyan gradient)

## Design Specifications

### Cards
- Background: rgba(19, 27, 46, 0.6) with backdrop-blur(20px)
- Border: 1px solid rgba(59, 73, 76, 0.1)
- Border radius: 16px (cards), 12px (inner elements)
- Hover: border color transitions to cyan/20%, subtle shadow glow

### Badges
- HOT: bg-red-500/15, text-red-400, border-red-500/25
- Rising: bg-emerald-500/10, text-emerald-400, border-emerald-500/20
- AI badge: purple gradient background, animated pulse dot

### Animations to indicate in design
- Radar sweep rotation on loading
- Typing cursor blink on AI summary
- Fade-in-up stagger on card reveals
- Pulse glow on active/hot elements
- Score bar width expansion animation
- Shimmer skeleton on loading states

### Spacing
- Page padding: 16px mobile, 24px desktop
- Card gap: 16px
- Section gap: 32px
- Stats card internal padding: 20px

### Iconography
- Use Material Symbols Outlined throughout
- Key icons: trending_up, group, movie, visibility, tag, category, search, menu, expand_more, open_in_new, neurology (AI), play_arrow

## Deliverables
Please design:
1. Web dashboard (1440px) — all states
2. Mobile dashboard (375px) — all states
3. Loading/scanning animation screen
4. Component library showing: cards, badges, buttons, search bar, tabs, stat cards
5. Color palette and typography scale reference
```

---

## Notes for use

- Paste the entire prompt above into Stitch AI
- If Stitch has a character limit, split into: "Design the web version first" then "Now design the mobile version"
- Add screenshots of the current dashboard as reference images if Stitch supports image uploads
- The design should match what's already built at https://huggingface.co/spaces/1oganthehusky/trendhunter
