import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { normalizeCreator } from "@/lib/parse";

function loadCreators() {
  const dataDir = join(process.cwd(), "data");
  const enrichedPath = join(dataDir, "enriched_summary.json");
  const rawPath = join(dataDir, "summary.json");

  const filePath = existsSync(enrichedPath) ? enrichedPath : rawPath;
  if (!existsSync(filePath)) {
    return [];
  }
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  // Normalize both old & new crawler formats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (raw as any[]).map(normalizeCreator);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() || "";
  const sort = searchParams.get("sort") || "followers";

  let creators = loadCreators();

  // Search filter
  if (search) {
    creators = creators.filter((c) => {
      const username = (c.username || "").toLowerCase();
      const nickname = (c.profile?.nickname || "").toLowerCase();
      const bio = (c.profile?.bio || "").toLowerCase();
      const hasHashtag = c.videos?.some(
        (v) => v.hashtags?.some((h: string) => h.toLowerCase().includes(search))
      );
      return (
        username.includes(search) ||
        nickname.includes(search) ||
        bio.includes(search) ||
        hasHashtag
      );
    });
  }

  // Sort
  const parseMetric = (s: string | number): number => {
    if (typeof s === "number") return s;
    if (!s) return 0;
    const clean = String(s).replace(/,/g, "").trim();
    if (clean.endsWith("M")) return Math.round(parseFloat(clean) * 1_000_000);
    if (clean.endsWith("K")) return Math.round(parseFloat(clean) * 1_000);
    return Math.round(parseFloat(clean)) || 0;
  };

  creators.sort((a, b) => {
    switch (sort) {
      case "followers":
        return parseMetric(b.profile?.followers) - parseMetric(a.profile?.followers);
      case "views": {
        const aViews = (a.videos || []).reduce(
          (sum: number, v) => sum + parseMetric(v.views),
          0
        );
        const bViews = (b.videos || []).reduce(
          (sum: number, v) => sum + parseMetric(v.views),
          0
        );
        return bViews - aViews;
      }
      case "videos":
        return (b.videosCount || 0) - (a.videosCount || 0);
      default:
        return parseMetric(b.profile?.followers) - parseMetric(a.profile?.followers);
    }
  });

  return Response.json(creators);
}
