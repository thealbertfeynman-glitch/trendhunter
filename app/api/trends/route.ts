import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { normalizeCreator, Creator, Video } from "@/lib/parse";
import { analyzeTrendGroups } from "@/lib/trendgroups";

// General/tool hashtags to exclude from trend ranking
// These are not content trends — they're tools, platforms, or generic tags
const EXCLUDED_HASHTAGS = new Set([
  // Tools & platforms
  "#capcut", "#capcutedit", "#capcutpioneer", "#capcuttemplate", "#capcuttutorial",
  "#capcutforus", "#capcutgala2026", "#templatecapcut", "#pioneertemplate",
  // Generic reach tags
  "#fyp", "#foryou", "#foryoupage", "#fypシ", "#fy", "#fyppage", "#fypシ゚viral", "#fypシ゚",
  "#foryoupage", "#fouryou", "#4page",
  "#viral", "#viralvideo", "#viraltiktok", "#goviral",
  "#tiktok", "#tiktokviral", "#tiktokindonesia", "#tiktokvietnam",
  "#trending", "#trendingvideo", "#trendingnow", "#trend",
  "#edit", "#editing", "#aftereffects", "#premiere",
  "#xyzbca", "#xyz", "#xyzcba",
  "#parati", "#pourtoi",
  // Platform/tool brand tags (not content trends)
  "#hypic", "#hypiccreator", "#godpic",
  "#klingai", "#klingcreators",
  "#dreamina", "#dreaminapioneer", "#dreaminaisnextgeneditor",
  "#ai", "#aiart", "#aitrend",
]);

// Check if hashtag matches any excluded pattern
function isExcludedHashtag(tag: string): boolean {
  const lower = tag.toLowerCase();
  if (EXCLUDED_HASHTAGS.has(lower)) return true;
  // Also exclude capcut/pioneer/kling/hypic variations
  if (lower.includes("capcut")) return true;
  if (lower.includes("pioneer") && lower.includes("template")) return true;
  if (lower === "#fyp" || lower.startsWith("#fyp")) return true;
  if (lower.includes("hypic") || lower.includes("godpic")) return true;
  if (lower.includes("kling")) return true;
  if (lower.includes("dreamina")) return true;
  return false;
}

function parseViews(s: string | number | null | undefined): number {
  if (s === null || s === undefined) return 0;
  const str = String(s).replace(/,/g, "").trim();
  if (!str) return 0;
  if (str.endsWith("M")) return Math.round(parseFloat(str) * 1_000_000);
  if (str.endsWith("K")) return Math.round(parseFloat(str) * 1_000);
  return Math.round(parseFloat(str)) || 0;
}

function formatNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function loadCreators(): Creator[] {
  const dataDir = join(process.cwd(), "data");
  const enriched = join(dataDir, "enriched_summary.json");
  const fallback = join(dataDir, "summary.json");
  const path = existsSync(enriched) ? enriched : existsSync(fallback) ? fallback : null;
  if (!path) return [];
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (raw as any[]).map(normalizeCreator);
}

function loadTrends() {
  const dataDir = join(process.cwd(), "data");
  const trendPath = join(dataDir, "trend_analysis.json");
  if (!existsSync(trendPath)) return null;
  return JSON.parse(readFileSync(trendPath, "utf-8"));
}

export async function GET() {
  const trendData = loadTrends();
  const creators = loadCreators();

  // Build hashtag → creators map AND hashtag → videos map
  const hashtagCreatorMap: Record<string, {
    username: string;
    avatar_url: string | null;
    followers: string;
    total_views: number;
    likes: number;
    shares: number;
    video_count: number;
    top_video_url: string | null;
  }[]> = {};

  const hashtagVideosMap: Record<string, {
    url: string;
    description: string;
    views: number;
    likes: number;
    shares: number;
    postedAt: string | null;
    dateText: string;
    thumbnail_url: string | null;
    creator_username: string;
    creator_avatar: string | null;
    products?: { name: string; link: string; price?: string | null; image?: string | null }[];
  }[]> = {};

  for (const creator of creators) {
    const hashtagVideos: Record<string, Video[]> = {};
    for (const video of creator.videos) {
      for (const tag of video.hashtags || []) {
        const normalized = tag.toLowerCase();
        if (!hashtagVideos[normalized]) hashtagVideos[normalized] = [];
        hashtagVideos[normalized].push(video);

        // Also add to the videos map
        if (!hashtagVideosMap[normalized]) hashtagVideosMap[normalized] = [];
        // Avoid duplicates
        if (!hashtagVideosMap[normalized].find((v) => v.url === video.url)) {
          hashtagVideosMap[normalized].push({
            url: video.url,
            description: video.description || "",
            views: parseViews(video.views),
            likes: parseViews(video.likes),
            shares: parseViews(video.shares),
            postedAt: video.postedAt,
            dateText: video.dateText || "",
            thumbnail_url: video.thumbnail_url || null,
            creator_username: creator.username,
            creator_avatar: creator.profile?.avatar_url || null,
            products: video.products || [],
          });
        }
      }
    }

    for (const [tag, videos] of Object.entries(hashtagVideos)) {
      if (!hashtagCreatorMap[tag]) hashtagCreatorMap[tag] = [];
      const totalViews = videos.reduce((s, v) => s + parseViews(v.views), 0);
      const totalLikes = videos.reduce((s, v) => s + parseViews(v.likes), 0);
      const totalShares = videos.reduce((s, v) => s + parseViews(v.shares), 0);
      const topVideo = [...videos].sort((a, b) => parseViews(b.views) - parseViews(a.views))[0];

      hashtagCreatorMap[tag].push({
        username: creator.username,
        avatar_url: creator.profile?.avatar_url || null,
        followers: creator.profile?.followers || "0",
        total_views: totalViews,
        likes: totalLikes,
        shares: totalShares,
        video_count: videos.length,
        top_video_url: topVideo?.url || null,
      });
    }
  }

  // Sort creators by views desc, videos by views desc
  for (const tag of Object.keys(hashtagCreatorMap)) {
    hashtagCreatorMap[tag].sort((a, b) => b.total_views - a.total_views);
  }
  for (const tag of Object.keys(hashtagVideosMap)) {
    hashtagVideosMap[tag].sort((a, b) => b.views - a.views);
  }

  // Generate AI executive summary
  // Filter out general/tool hashtags and re-rank
  const rawTrends = trendData?.trends || [];
  const trends = rawTrends
    .filter((t: { hashtag: string }) => !isExcludedHashtag(t.hashtag))
    .map((t: { hashtag: string; rank: number }, i: number) => ({ ...t, rank: i + 1 }));
  const topTrend = trends[0];
  const risingTrend = trends.find(
    (t: { freshness: number; rank: number }) => t.freshness > 0.4 && t.rank > 3
  );
  const totalCreatorsCount = creators.length;
  const totalVideosCount = creators.reduce((s, c) => s + (c.videos?.length || 0), 0);
  const totalViews = creators.reduce(
    (s, c) => s + c.videos.reduce((vs, v) => vs + parseViews(v.views), 0), 0
  );

  // Count videos with products (TrendHunter Crawler feature)
  const videosWithProducts = creators.reduce(
    (s, c) => s + c.videos.filter((v) => v.products && v.products.length > 0).length, 0
  );

  const summaryPoints: string[] = [];

  if (topTrend) {
    summaryPoints.push(
      `Dominant trend: ${topTrend.hashtag} leads with ${topTrend.creator_count} creators and ${formatNum(topTrend.total_views)} total views, indicating strong cross-creator adoption.`
    );
  }

  if (risingTrend) {
    summaryPoints.push(
      `Rising signal: ${risingTrend.hashtag} shows ${Math.round(risingTrend.freshness * 100)}% freshness score — early-stage trend with growth potential.`
    );
  }

  const creatorsByViews = creators
    .map((c) => ({
      username: c.username,
      views: c.videos.reduce((s, v) => s + parseViews(v.views), 0),
    }))
    .sort((a, b) => b.views - a.views);

  if (creatorsByViews[0]) {
    const topC = creatorsByViews[0];
    const pct = totalViews > 0 ? Math.round((topC.views / totalViews) * 100) : 0;
    summaryPoints.push(
      `Key creator: @${topC.username} drives ${pct}% of total views (${formatNum(topC.views)}), making them the primary content engine.`
    );
  }

  // Product/commerce insight
  if (videosWithProducts > 0) {
    const pctProducts = Math.round((videosWithProducts / totalVideosCount) * 100);
    summaryPoints.push(
      `Commerce signal: ${videosWithProducts} videos (${pctProducts}%) have TikTok Shop products attached — monetization activity detected.`
    );
  }

  const capcut = trends.filter((t: { hashtag: string }) =>
    t.hashtag.includes("capcut") || t.hashtag.includes("pioneer")
  );
  if (capcut.length >= 2) {
    summaryPoints.push(
      `Tool ecosystem: CapCut-related hashtags appear across ${capcut[0].creator_count}+ creators — dominant editing tool in this niche.`
    );
  }

  const danceTrends = trends.filter((t: { hashtag: string }) => t.hashtag.includes("danc"));
  if (danceTrends.length >= 2) {
    summaryPoints.push(
      `Content niche: Dance content dominates with ${danceTrends.length} hashtag variations — creators cluster around dance/choreography.`
    );
  }

  summaryPoints.push(
    `Dataset: ${totalCreatorsCount} creators · ${totalVideosCount} videos · ${formatNum(totalViews)} total views tracked.`
  );

  // Count excluded hashtags for transparency
  const excludedCount = rawTrends.length - trends.length;
  if (excludedCount > 0) {
    summaryPoints.push(
      `Filter: ${excludedCount} generic/tool hashtags excluded from ranking (CapCut, FYP, etc.) to focus on content trends.`
    );
  }

  // ── TrendGroup Analysis ──
  const trendGroups = analyzeTrendGroups(creators);

  // Add trend group insights to executive summary
  if (trendGroups.length > 0) {
    const topGroup = trendGroups[0];
    summaryPoints.unshift(
      `Content landscape: "${topGroup.name}" dominates with ${topGroup.videoCount} videos across ${topGroup.creatorCount} creators (${formatNum(topGroup.totalViews)} views) — ${topGroup.description.toLowerCase()}`
    );

    const hotGroups = trendGroups.filter((g) => g.growthSignal === "hot");
    const risingGroups = trendGroups.filter((g) => g.growthSignal === "rising");
    if (hotGroups.length > 0 || risingGroups.length > 0) {
      const signals = [
        ...hotGroups.map((g) => `🔥 ${g.name}`),
        ...risingGroups.map((g) => `📈 ${g.name}`),
      ];
      summaryPoints.push(
        `Growth signals: ${signals.join(", ")} — these content categories show strongest momentum.`
      );
    }
  }

  const response = {
    ...(trendData || {
      generated_at: new Date().toISOString(),
      analysis_period: "N/A",
      total_creators: totalCreatorsCount,
      total_videos: totalVideosCount,
    }),
    trends, // filtered & re-ranked
    trend_groups: trendGroups,
    hashtag_creators: hashtagCreatorMap,
    hashtag_videos: hashtagVideosMap,
    executive_summary: summaryPoints,
  };

  return Response.json(response);
}
