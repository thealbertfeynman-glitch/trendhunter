// Parse "17.1K" → 17100, "6.5M" → 6500000, "3139" → 3139
export function parseMetric(s: string | number | null | undefined): number {
  if (s === null || s === undefined) return 0;
  const str = String(s).replace(/,/g, "").trim();
  if (!str) return 0;
  if (str.endsWith("M")) return Math.round(parseFloat(str) * 1_000_000);
  if (str.endsWith("K")) return Math.round(parseFloat(str) * 1_000);
  return Math.round(parseFloat(str)) || 0;
}

// Format 17100 → "17.1K"
export function formatMetric(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

// "2026-04-03T09:53:03.000Z" → "21h ago"
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "\u2014";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// Generate a gradient based on string hash
export function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    "from-cyan-600 to-blue-800",
    "from-purple-600 to-indigo-800",
    "from-pink-600 to-rose-800",
    "from-emerald-600 to-teal-800",
    "from-amber-600 to-orange-800",
    "from-violet-600 to-purple-800",
    "from-sky-600 to-cyan-800",
    "from-fuchsia-600 to-pink-800",
  ];
  return gradients[Math.abs(hash) % gradients.length];
}

export function getInitials(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 2)
    .toUpperCase();
}

// ── Product interface (from TrendHunter Crawler) ──
export interface Product {
  name: string;
  link: string;
  price?: string | null;
  image?: string | null;
}

// ── Normalized Creator interface ──
// Supports both old format (avatar_url, thumbnail_url) and
// new TrendHunter Crawler format (avatar, thumbnail, products)
export interface Creator {
  username: string;
  url: string;
  profile: {
    nickname: string;
    bio: string;
    followers: string;
    following: string;
    likes: string;
    avatar_url?: string | null;  // normalized from avatar or avatar_url
  };
  videosCount: number;
  videos: Video[];
  crawledAt?: string;
}

export interface Video {
  url: string;
  description: string;
  hashtags: string[];
  views: string;
  likes: string;
  comments: string;
  shares: string;
  saves: string;
  music: string;
  postedAt: string | null;
  dateSource?: string;
  dateText?: string;
  isPinned: boolean;
  thumbnail_url?: string | null;  // normalized from thumbnail or thumbnail_url
  thumbnail_width?: number | null;
  thumbnail_height?: number | null;
  products?: Product[];  // from TrendHunter Crawler
}

export interface HashtagCreator {
  username: string;
  avatar_url: string | null;
  followers: string;
  total_views: number;
  likes: number;
  shares: number;
  video_count: number;
  top_video_url: string | null;
}

export interface HashtagVideo {
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
  products?: Product[];
}

export interface TrendData {
  generated_at: string;
  analysis_period: string;
  total_creators: number;
  total_videos: number;
  trends: Trend[];
  hashtag_creators?: Record<string, HashtagCreator[]>;
  hashtag_videos?: Record<string, HashtagVideo[]>;
  executive_summary?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trend_groups?: any[];
}

export interface Trend {
  rank: number;
  hashtag: string;
  trend_score: number;
  creator_count: number;
  video_count: number;
  total_views: number;
  freshness: number;
  sample_videos: {
    url: string;
    creator: string;
    views: number;
    posted: string | null;
  }[];
}

// ── Normalizer: handles both old and new crawler formats ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeCreator(raw: any): Creator {
  const profile = raw.profile || {};
  // avatar: new format uses "avatar", old uses "avatar_url"
  const avatar_url = profile.avatar_url || profile.avatar || null;

  const videos = (raw.videos || []).map(normalizeVideo);

  return {
    username: raw.username || "",
    url: raw.url || "",
    profile: {
      nickname: profile.nickname || profile.name || raw.username || "",
      bio: profile.bio || "",
      followers: String(profile.followers || "0"),
      following: String(profile.following || "0"),
      likes: String(profile.likes || "0"),
      avatar_url,
    },
    videosCount: raw.videosCount ?? videos.length,
    videos,
    crawledAt: raw.crawledAt || null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeVideo(raw: any): Video {
  // thumbnail: new format uses "thumbnail", old uses "thumbnail_url"
  const thumbnail_url = raw.thumbnail_url || raw.thumbnail || null;

  return {
    url: raw.url || "",
    description: raw.description || "",
    hashtags: raw.hashtags || [],
    views: String(raw.views || "0"),
    likes: String(raw.likes || "0"),
    comments: String(raw.comments || "0"),
    shares: String(raw.shares || "0"),
    saves: String(raw.saves || "0"),
    music: raw.music || "",
    postedAt: raw.postedAt || null,
    dateSource: raw.dateSource || "",
    dateText: raw.dateText || "",
    isPinned: raw.isPinned || false,
    thumbnail_url,
    thumbnail_width: raw.thumbnail_width || null,
    thumbnail_height: raw.thumbnail_height || null,
    products: raw.products || [],
  };
}
