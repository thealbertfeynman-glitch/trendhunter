"use client";

import { Video } from "@/lib/parse";
import { parseMetric, formatMetric, timeAgo } from "@/lib/parse";
import HashtagBadge from "./HashtagBadge";

interface VideoCardProps {
  video: Video;
  creatorUsername: string;
}

export default function VideoCard({ video, creatorUsername }: VideoCardProps) {
  const views = parseMetric(video.views);
  const isViral = views >= 10000;

  return (
    <div
      onClick={() => window.open(video.url, "_blank")}
      className="group flex gap-3 p-3 rounded-xl bg-surface-container-lowest/50 hover:bg-surface-container-high/60 border border-transparent hover:border-primary-container/20 transition-all cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-[72px] h-[96px] rounded-lg overflow-hidden bg-surface-container border border-outline-variant/10 relative">
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url}
            alt={video.description || "Video thumbnail"}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-2xl">
              play_arrow
            </span>
          </div>
        )}
        {video.isPinned && (
          <div className="absolute top-1 left-1 bg-primary-container/90 text-on-primary-fixed text-[8px] font-black px-1 py-0.5 rounded">
            PIN
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
            <span className="material-symbols-outlined text-white text-sm">open_in_new</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <p className="text-sm text-on-surface/90 line-clamp-2 leading-snug mb-1.5">
            {video.description || `Video by @${creatorUsername}`}
          </p>
          {video.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {video.hashtags.slice(0, 4).map((tag) => (
                <HashtagBadge key={tag} tag={tag} />
              ))}
              {video.hashtags.length > 4 && (
                <span className="text-[10px] text-on-surface-variant">
                  +{video.hashtags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          <span
            className={`text-xs font-bold ${isViral ? "text-tertiary-container" : "text-on-surface-variant"}`}
          >
            {isViral && (
              <span className="material-symbols-outlined text-[12px] align-middle mr-0.5">
                local_fire_department
              </span>
            )}
            {formatMetric(views)} views
          </span>
          <span className="text-[10px] text-on-surface-variant">{timeAgo(video.postedAt)}</span>
          {video.products && video.products.length > 0 && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/25 text-[9px] font-bold text-amber-400">
              <span className="material-symbols-outlined text-[10px]">shopping_bag</span>
              {video.products.length} product{video.products.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
