"use client";

import { Creator } from "@/lib/parse";
import { parseMetric, formatMetric, hashColor, getInitials } from "@/lib/parse";
import VideoCard from "./VideoCard";

interface CreatorCardProps {
  creator: Creator;
  isExpanded: boolean;
  onToggle: () => void;
  rank: number;
}

export default function CreatorCard({ creator, isExpanded, onToggle, rank }: CreatorCardProps) {
  const followers = parseMetric(creator.profile?.followers);
  const totalViews = creator.videos.reduce((sum, v) => sum + parseMetric(v.views), 0);
  const isTop = followers >= 100000;

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isExpanded
          ? "bg-surface-container border-primary-container/20"
          : "bg-surface-container-low border-outline-variant/10 hover:border-primary-container/15"
      }`}
    >
      {/* Header */}
      <div className="p-5 cursor-pointer group" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              {creator.profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={creator.profile.avatar_url}
                  alt={creator.username}
                  className="w-12 h-12 rounded-full border-2 border-primary-container/30 object-cover"
                />
              ) : (
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${hashColor(creator.username)} flex items-center justify-center text-white font-bold text-sm border-2 border-primary-container/20`}
                >
                  {getInitials(creator.username)}
                </div>
              )}
              {rank <= 3 && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface flex items-center justify-center text-[10px]">
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                </span>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-on-surface">@{creator.username}</h3>
                {isTop && (
                  <span className="bg-gradient-to-r from-tertiary-container to-error text-on-primary-fixed text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tight">
                    TOP
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-on-surface-variant">
                  <span className="font-bold text-on-surface font-headline">
                    {formatMetric(followers)}
                  </span>{" "}
                  followers
                </span>
                <span className="text-outline-variant">|</span>
                <span className="text-xs text-on-surface-variant">
                  <span className="font-bold text-on-surface font-headline">
                    {formatMetric(totalViews)}
                  </span>{" "}
                  views
                </span>
                <span className="text-outline-variant hidden sm:inline">|</span>
                <span className="text-xs text-on-surface-variant hidden sm:inline">
                  <span className="font-bold text-on-surface font-headline">
                    {creator.videosCount}
                  </span>{" "}
                  videos
                </span>
              </div>
            </div>
          </div>

          {/* Expand indicator */}
          <div className="flex items-center gap-2">
            <a
              href={creator.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-surface-container-highest/50 rounded-lg text-[10px] font-bold text-on-surface-variant hover:bg-primary-container hover:text-on-primary-fixed transition-colors"
            >
              PROFILE
              <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </a>
            <span
              className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
            >
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Expanded: Video list */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-2 border-t border-outline-variant/10 pt-4">
          {creator.videos.length > 0 ? (
            creator.videos.map((video) => (
              <VideoCard key={video.url} video={video} creatorUsername={creator.username} />
            ))
          ) : (
            <p className="text-sm text-on-surface-variant text-center py-4">
              No videos available
            </p>
          )}
        </div>
      )}
    </div>
  );
}
