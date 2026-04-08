// TrendGroup Analysis Engine
// Analyzes video descriptions, hashtags, and metadata to cluster content into trend groups
// This adds a second dimension beyond hashtags — understanding WHAT the content is about

export interface TrendGroup {
  id: string;
  name: string;
  icon: string;          // Material icon name
  color: string;         // Tailwind color class
  description: string;
  keywords: string[];    // Keywords to match in descriptions
  hashtagPatterns: string[]; // Hashtag patterns to match
  videoCount: number;
  creatorCount: number;
  totalViews: number;
  avgViews: number;
  topCreators: { username: string; views: number; avatar_url: string | null }[];
  topVideos: { url: string; description: string; views: number; creator: string; thumbnail_url: string | null }[];
  relatedHashtags: { tag: string; count: number }[];
  growthSignal: "hot" | "rising" | "stable" | "niche";
  trendScore: number;
}

// ── Trend Group Definitions ──
// Each group defines keyword patterns for description matching and hashtag matching
const GROUP_DEFINITIONS = [
  {
    id: "ai-dance",
    name: "AI Dance Effects",
    icon: "music_note",
    color: "from-pink-500 to-rose-600",
    description: "AI-generated dance videos from photos — the dominant viral format",
    keywords: [
      "dance tutorial", "dance video", "dancing ai", "ai dancing", "dance effect",
      "dance filter", "dance trend", "dance challenge", "choreography",
      "let me be dance", "bakito", "dirty dancing", "cwalk", "c-walk",
      "ghost effect", "dance lesson", "step by step", "slow tutorial",
      "mirror dance", "dance song", "seedance", "ai dance",
    ],
    hashtagPatterns: [
      "dance", "dancing", "cwalk", "dirtydancing", "letmebe", "bakito",
      "seedance", "aidance", "danceai", "tánctrend", "choreograph",
    ],
  },
  {
    id: "ai-photo",
    name: "AI Photo Generation",
    icon: "photo_camera",
    color: "from-violet-500 to-purple-600",
    description: "AI-powered photo creation — couple shots, artistic portraits, templates",
    keywords: [
      "couple photo", "romantic photo", "sleeping couple", "sweet couple",
      "photo ai", "ai photo", "foto ia", "foto com", "photo effect",
      "photo template", "ai portrait", "ai image", "couple template",
      "cozy and romantic", "couple shots", "ai wallpaper",
    ],
    hashtagPatterns: [
      "hypic", "hypiccreator", "godpic", "aiphoto", "aiart",
      "aiportrait", "aiwallpaper", "aiimage", "coupleai",
    ],
  },
  {
    id: "ai-filter",
    name: "AI Filters & Effects",
    icon: "auto_awesome",
    color: "from-amber-500 to-orange-600",
    description: "AR filters and AI effects — bride filters, soulmate filters, transformations",
    keywords: [
      "filter", "ai filter", "effect", "ai effect", "bride filter",
      "soulmate filter", "transformation", "before after", "glow up",
      "ai makeup", "beauty filter", "face filter",
      "عروس", "فلتر",  // Arabic: bride, filter
    ],
    hashtagPatterns: [
      "filter", "soulmatefilter", "aifilter", "aieffect",
      "عروس", "فلتر", "تصميم",
    ],
  },
  {
    id: "ai-video-edit",
    name: "AI Video Editing",
    icon: "movie_edit",
    color: "from-cyan-500 to-teal-600",
    description: "CapCut templates, pioneer effects, and AI-powered video editing tutorials",
    keywords: [
      "template", "capcut template", "pioneer template", "video editing",
      "editing tutorial", "how to edit", "transition", "effect tutorial",
      "capcut tutorial", "edit tutorial", "how to make", "create",
      "show off the ring", "fighting ai", "trend ai",
    ],
    hashtagPatterns: [
      "pioneertemplate", "templatecapcut", "capcuttemplate",
      "tutorial", "editing", "transition",
    ],
  },
  {
    id: "ai-tools",
    name: "AI Tools & Platforms",
    icon: "smart_toy",
    color: "from-emerald-500 to-green-600",
    description: "AI assistant tools — Dola, Gemini, Dreamina, Kling AI",
    keywords: [
      "dola", "gemini", "dreamina", "kling ai", "kling creator",
      "ai assistant", "ai tool", "ai gratis", "ai free",
      "scan", "escanea", "prompt", "ai prompt",
    ],
    hashtagPatterns: [
      "dola", "gemini", "dreamina", "dreaminapioneer", "dreaminaisnextgeneditor",
      "klingai", "klingcreators", "prompt", "aiprompt",
    ],
  },
  {
    id: "food-trend",
    name: "Food & Lifestyle Trends",
    icon: "restaurant",
    color: "from-red-500 to-pink-600",
    description: "Food-related viral content — tomato trend, recipe effects, lifestyle",
    keywords: [
      "tomate", "tomato", "food", "recipe", "cooking",
      "fruta", "fruit", "comida", "foto com o tomate",
    ],
    hashtagPatterns: [
      "tomate", "tomato", "food", "recipe", "fruta", "comofazer",
    ],
  },
  {
    id: "sports-trend",
    name: "Sports & Entertainment",
    icon: "sports_basketball",
    color: "from-blue-500 to-indigo-600",
    description: "Sports edits, NBA trends, entertainment mashups",
    keywords: [
      "nba", "lebron", "basketball", "sports", "football",
      "soccer", "athlete", "game", "match", "league",
      "wade", "dunk", "highlight",
    ],
    hashtagPatterns: [
      "nba", "lebron", "basketball", "sports", "lebrondwade",
      "nbaedittutorial",
    ],
  },
];

// ── Matching Logic ──

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s#@]/g, " ")  // remove emojis and special chars
    .replace(/\s+/g, " ")
    .trim();
}

function matchScore(
  description: string,
  hashtags: string[],
  group: typeof GROUP_DEFINITIONS[0]
): number {
  const normalDesc = normalizeText(description);
  const normalTags = hashtags.map((h) => h.toLowerCase().replace("#", ""));
  let score = 0;

  // Description keyword matching (weighted by specificity)
  for (const keyword of group.keywords) {
    const normalKey = keyword.toLowerCase();
    if (normalDesc.includes(normalKey)) {
      // Longer keywords = more specific = higher score
      score += Math.max(1, normalKey.split(" ").length * 2);
    }
  }

  // Hashtag pattern matching
  for (const pattern of group.hashtagPatterns) {
    const normalPattern = pattern.toLowerCase();
    for (const tag of normalTags) {
      if (tag.includes(normalPattern) || normalPattern.includes(tag)) {
        score += 3; // Hashtag matches are strong signals
      }
    }
  }

  return score;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function analyzeTrendGroups(creators: any[]): TrendGroup[] {
  // For each video, compute match scores for all groups
  const groupData: Record<string, {
    videos: { url: string; description: string; views: number; creator: string; thumbnail_url: string | null; score: number }[];
    creators: Map<string, { views: number; avatar_url: string | null }>;
    hashtags: Map<string, number>;
  }> = {};

  // Initialize
  for (const def of GROUP_DEFINITIONS) {
    groupData[def.id] = { videos: [], creators: new Map(), hashtags: new Map() };
  }

  // Classify each video
  for (const creator of creators) {
    for (const video of creator.videos || []) {
      const desc = video.description || "";
      const tags: string[] = video.hashtags || [];
      const views = parseViewCount(video.views);

      // Score against each group
      const scores: { groupId: string; score: number }[] = [];
      for (const def of GROUP_DEFINITIONS) {
        const s = matchScore(desc, tags, def);
        if (s > 0) scores.push({ groupId: def.id, score: s });
      }

      // Assign to best-matching group (if score >= threshold)
      scores.sort((a, b) => b.score - a.score);
      const bestMatch = scores[0];
      if (bestMatch && bestMatch.score >= 3) {
        const gd = groupData[bestMatch.groupId];
        gd.videos.push({
          url: video.url,
          description: desc.slice(0, 120),
          views,
          creator: creator.username,
          thumbnail_url: video.thumbnail_url || video.thumbnail || null,
          score: bestMatch.score,
        });

        // Track creators
        const existing = gd.creators.get(creator.username);
        if (existing) {
          existing.views += views;
        } else {
          gd.creators.set(creator.username, {
            views,
            avatar_url: creator.profile?.avatar_url || creator.profile?.avatar || null,
          });
        }

        // Track hashtags (excluding generic ones)
        for (const tag of tags) {
          const lower = tag.toLowerCase();
          if (!isGenericTag(lower)) {
            gd.hashtags.set(lower, (gd.hashtags.get(lower) || 0) + 1);
          }
        }
      }
    }
  }

  // Build output
  const results: TrendGroup[] = [];
  for (const def of GROUP_DEFINITIONS) {
    const gd = groupData[def.id];
    if (gd.videos.length === 0) continue;

    const totalViews = gd.videos.reduce((s, v) => s + v.views, 0);
    const avgViews = Math.round(totalViews / gd.videos.length);

    // Top creators by views
    const topCreators = [...gd.creators.entries()]
      .map(([username, data]) => ({ username, views: data.views, avatar_url: data.avatar_url }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Top videos by views
    const topVideos = [...gd.videos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 6);

    // Related hashtags by frequency
    const relatedHashtags = [...gd.hashtags.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Growth signal
    const growthSignal = determineGrowth(gd.creators.size, totalViews, avgViews);

    // Trend score: weighted combination
    const trendScore = Math.round(
      gd.creators.size * 3 +
      Math.log10(totalViews + 1) * 10 +
      gd.videos.length * 0.5
    );

    results.push({
      id: def.id,
      name: def.name,
      icon: def.icon,
      color: def.color,
      description: def.description,
      keywords: def.keywords.slice(0, 5),
      hashtagPatterns: def.hashtagPatterns.slice(0, 5),
      videoCount: gd.videos.length,
      creatorCount: gd.creators.size,
      totalViews,
      avgViews,
      topCreators,
      topVideos,
      relatedHashtags,
      growthSignal,
      trendScore,
    });
  }

  // Sort by trend score
  results.sort((a, b) => b.trendScore - a.trendScore);
  return results;
}

function determineGrowth(creatorCount: number, totalViews: number, avgViews: number): "hot" | "rising" | "stable" | "niche" {
  if (creatorCount >= 8 && totalViews >= 500000) return "hot";
  if (creatorCount >= 4 && avgViews >= 10000) return "rising";
  if (creatorCount >= 3) return "stable";
  return "niche";
}

function parseViewCount(s: string | number | null | undefined): number {
  if (s === null || s === undefined) return 0;
  const str = String(s).replace(/,/g, "").trim();
  if (!str) return 0;
  if (str.endsWith("M")) return Math.round(parseFloat(str) * 1_000_000);
  if (str.endsWith("K")) return Math.round(parseFloat(str) * 1_000);
  return Math.round(parseFloat(str)) || 0;
}

function isGenericTag(tag: string): boolean {
  const generic = new Set([
    "#capcut", "#capcutpioneer", "#capcutforus", "#fyp", "#foryou",
    "#foryoupage", "#viral", "#trending", "#tiktok", "#fypシ",
    "#pioneertemplate", "#xyzbca", "#parati", "#pourtoi",
    "#fypシ゚viral", "#fypシ゚", "#trend",
  ]);
  return generic.has(tag);
}
