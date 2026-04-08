"use client";

import { useState, useEffect, useRef } from "react";
import { Trend, Creator, HashtagCreator, HashtagVideo } from "@/lib/parse";
import { formatMetric, timeAgo, getInitials, hashColor } from "@/lib/parse";
import { TrendGroup } from "@/lib/trendgroups";

interface TrendBoardProps {
  trends: Trend[];
  hashtagCreators?: Record<string, HashtagCreator[]>;
  hashtagVideos?: Record<string, HashtagVideo[]>;
  executiveSummary?: string[];
  allCreators?: Creator[];
  trendGroups?: TrendGroup[];
}

/* ── AI Typing effect hook ── */
function useTypingEffect(texts: string[], speed = 22, delayBetween = 400) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isThinking, setIsThinking] = useState(true);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!texts || texts.length === 0) {
      setIsDone(true);
      return;
    }

    // Initial "thinking" delay
    const thinkTimer = setTimeout(() => {
      setIsThinking(false);
    }, 400);
    return () => clearTimeout(thinkTimer);
  }, [texts]);

  useEffect(() => {
    if (isThinking || isDone || !texts || texts.length === 0) return;
    if (currentIdx >= texts.length) {
      setIsDone(true);
      return;
    }

    const fullText = texts[currentIdx];
    if (currentText.length < fullText.length) {
      const timer = setTimeout(() => {
        setCurrentText(fullText.slice(0, currentText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else {
      // Finished this line
      const timer = setTimeout(() => {
        setDisplayed((prev) => [...prev, fullText]);
        setCurrentText("");
        setCurrentIdx((prev) => prev + 1);
      }, delayBetween);
      return () => clearTimeout(timer);
    }
  }, [isThinking, isDone, currentIdx, currentText, texts, speed, delayBetween]);

  return { displayed, currentText, isThinking, isDone };
}

/* ── Animated number counter ── */
function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  // Update immediately if value changes without animation needing to re-run
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const from = prevValue.current === value ? 0 : prevValue.current;
    prevValue.current = value;
    startTime.current = null;
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const elapsed = ts - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value, duration]);

  return <>{formatMetric(display)}</>;
}

/* ── Skeleton loaders ── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low/60 p-5 sm:p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="skeleton h-7 w-48" />
          <div className="flex gap-3">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-16" />
          </div>
        </div>
        <div className="skeleton h-10 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export default function TrendBoard({
  trends,
  hashtagCreators = {},
  hashtagVideos = {},
  executiveSummary = [],
  trendGroups = [],
}: TrendBoardProps) {
  const [expandedHashtag, setExpandedHashtag] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"views" | "score">("views");
  const [phase, setPhase] = useState<"scanning" | "analyzing" | "ready">("scanning");
  const [visibleCards, setVisibleCards] = useState(0);
  const [activeSection, setActiveSection] = useState<"groups" | "hashtags">("hashtags");
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const typing = useTypingEffect(executiveSummary, 8, 150);

  // Phased loading animation
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("analyzing"), 500);
    const t2 = setTimeout(() => setPhase("ready"), 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Staggered card reveal
  useEffect(() => {
    if (phase !== "ready") return;
    const total = trends.length;
    if (visibleCards >= total) return;
    const timer = setTimeout(() => {
      setVisibleCards((prev) => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, [phase, visibleCards, trends.length]);

  if (!trends || trends.length === 0) {
    return (
      <div className="glass-card rounded-xl border border-outline-variant/10 p-8 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">
          query_stats
        </span>
        <p className="text-on-surface-variant">
          No trends found. Run <code className="text-primary-container">analyze_trends.py</code> to generate trend data.
        </p>
      </div>
    );
  }

  const sortedTrends =
    sortBy === "views"
      ? [...trends].sort((a, b) => b.total_views - a.total_views)
      : [...trends].sort((a, b) => b.trend_score - a.trend_score);

  return (
    <div className="space-y-6">
      {/* ── Phase: Scanning ── */}
      {phase === "scanning" && (
        <div className="relative overflow-hidden rounded-2xl border border-primary-container/20 bg-surface-container-low p-8 animate-fade-in-up">
          <div className="flex items-center gap-4">
            {/* Mini radar */}
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-full h-full" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" stroke="#00e5ff" strokeWidth="0.8" opacity="0.2" fill="none"/>
                <circle cx="24" cy="24" r="12" stroke="#00e5ff" strokeWidth="0.8" opacity="0.3" fill="none"/>
                <circle cx="24" cy="24" r="2" fill="#00e5ff" opacity="0.8"/>
              </svg>
              <div className="absolute inset-0 animate-radar-sweep" style={{transformOrigin: '50% 50%'}}>
                <svg className="w-full h-full" viewBox="0 0 48 48">
                  <line x1="24" y1="24" x2="24" y2="4" stroke="#00e5ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-primary-container font-headline">Scanning hashtag signals</span>
                <span className="inline-flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-primary-container animate-data-dot" />
                  <span className="w-1 h-1 rounded-full bg-primary-container animate-data-dot" style={{animationDelay:'0.3s'}} />
                  <span className="w-1 h-1 rounded-full bg-primary-container animate-data-dot" style={{animationDelay:'0.6s'}} />
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Detecting viral patterns across {trends.length} hashtags from creator network
              </p>
            </div>
          </div>
          {/* Scan line effect */}
          <div className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-container/60 to-transparent animate-scan-line" />
        </div>
      )}

      {/* ── Phase: Analyzing (skeleton) ── */}
      {phase === "analyzing" && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="relative overflow-hidden rounded-2xl border border-[#6d11ad]/20 bg-surface-container-low p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#6d11ad]/20 border border-[#6d11ad]/30 flex items-center justify-center animate-pulse-glow">
                <span className="material-symbols-outlined text-[#c77dff] text-sm">neurology</span>
              </div>
              <div className="flex-1">
                <span className="text-sm font-bold text-[#c77dff] font-headline">AI is analyzing patterns</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="h-1 flex-1 max-w-48 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full rounded-full animate-neural" style={{width: '60%', transition: 'width 1s ease'}} />
                  </div>
                  <span className="text-[10px] text-on-surface-variant">Processing</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-4/5" />
              <div className="skeleton h-4 w-3/5" />
            </div>
          </div>
          {/* Skeleton cards */}
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      )}

      {/* ── Phase: Ready ── */}
      {phase === "ready" && (
        <>
          {/* AI Executive Summary with typing */}
          {executiveSummary.length > 0 && (
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-[#6d11ad]/30 bg-gradient-to-br from-[#6d11ad]/8 via-surface-container-low to-[#00e5ff]/5 animate-fade-in-up">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6d11ad]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#6d11ad]/20 border border-[#6d11ad]/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#c77dff] text-sm">neurology</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-sm font-bold text-[#c77dff]">AI Executive Summary</h3>
                    <p className="text-[10px] text-on-surface-variant">Auto-generated insights from trend data</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#6d11ad]/15 border border-[#6d11ad]/25">
                    <span className={`w-1.5 h-1.5 rounded-full ${typing.isDone ? 'bg-emerald-400' : 'bg-[#c77dff] animate-pulse'}`} />
                    <span className="text-[9px] font-bold text-[#c77dff] uppercase tracking-wider">
                      {typing.isDone ? 'Done' : typing.isThinking ? 'Thinking' : 'Writing'}
                    </span>
                  </div>
                </div>

                {/* Thinking state */}
                {typing.isThinking && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#c77dff]/60 animate-data-dot" />
                      <div className="w-2 h-2 rounded-full bg-[#c77dff]/60 animate-data-dot" style={{animationDelay:'0.3s'}} />
                      <div className="w-2 h-2 rounded-full bg-[#c77dff]/60 animate-data-dot" style={{animationDelay:'0.6s'}} />
                    </div>
                    <span className="text-sm text-on-surface-variant/70 italic">Analyzing trend data and formulating insights...</span>
                  </div>
                )}

                {/* Typed lines — collapsible on mobile */}
                <div className="space-y-2">
                  {typing.displayed
                    .filter((_, i) => summaryExpanded || i < 3)
                    .map((line, i) => (
                    <div key={i} className="flex gap-2 sm:gap-3 animate-fade-in-up" style={{animationDelay: `${i * 0.05}s`}}>
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#6d11ad]/20 flex items-center justify-center mt-0.5">
                        <span className="text-[10px] font-bold text-[#c77dff]">{i + 1}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-on-surface/90 leading-relaxed">{line}</p>
                    </div>
                  ))}

                  {/* Currently typing line */}
                  {!typing.isDone && !typing.isThinking && typing.currentText && (
                    <div className="flex gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#6d11ad]/20 flex items-center justify-center mt-0.5">
                        <span className="text-[10px] font-bold text-[#c77dff]">{typing.displayed.length + 1}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-on-surface/90 leading-relaxed">
                        {typing.currentText}
                        <span className="inline-block w-0.5 h-4 bg-[#c77dff] ml-0.5 align-middle animate-blink" />
                      </p>
                    </div>
                  )}

                  {/* Show more/less toggle */}
                  {typing.isDone && typing.displayed.length > 3 && (
                    <button
                      onClick={() => setSummaryExpanded(!summaryExpanded)}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#c77dff]/70 hover:text-[#c77dff] transition-colors mt-1 ml-7"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {summaryExpanded ? "expand_less" : "expand_more"}
                      </span>
                      {summaryExpanded ? "Show less" : `+${typing.displayed.length - 3} more insights`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section Tabs: Trend Groups vs Hashtags */}
          <div className="flex items-center justify-between animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center gap-1 bg-surface-container-highest/40 rounded-xl p-1">
              <button
                onClick={() => setActiveSection("hashtags")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSection === "hashtags"
                    ? "bg-primary-container/20 text-primary-container shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-sm align-middle mr-1">tag</span>
                Hashtags
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary-container/15 text-[9px]">
                  {trends.length}
                </span>
              </button>
              <button
                onClick={() => setActiveSection("groups")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeSection === "groups"
                    ? "bg-primary-container/20 text-primary-container shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-sm align-middle mr-1">category</span>
                Trend Groups
                {trendGroups.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary-container/15 text-[9px]">
                    {trendGroups.length}
                  </span>
                )}
              </button>
            </div>
            {activeSection === "hashtags" && (
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "views" | "score")}
                  className="bg-surface-container border border-outline-variant/20 rounded-lg px-3 py-1.5 text-xs font-bold text-on-surface focus:outline-none focus:border-primary-container/40"
                >
                  <option value="views">views</option>
                  <option value="score">trend score</option>
                </select>
              </div>
            )}
          </div>

          {/* ═══ TREND GROUPS SECTION ═══ */}
          {activeSection === "groups" && trendGroups.length > 0 && (
            <div className="space-y-4">
              {trendGroups.map((group, gIdx) => {
                const isGExpanded = expandedGroup === group.id;
                const signalColors = {
                  hot: "bg-red-500/15 text-red-400 border-red-500/25",
                  rising: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                  stable: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                  niche: "bg-gray-500/10 text-gray-400 border-gray-500/20",
                };
                const signalLabels = { hot: "HOT", rising: "Rising", stable: "Stable", niche: "Niche" };

                return (
                  <div
                    key={group.id}
                    className={`rounded-2xl border transition-all duration-500 overflow-hidden animate-fade-in-up ${
                      isGExpanded
                        ? "border-primary-container/30 bg-surface-container-low shadow-[0_0_40px_rgba(0,229,255,0.06)]"
                        : "border-outline-variant/10 bg-surface-container-low/60 hover:border-outline-variant/25"
                    }`}
                    style={{ animationDelay: `${gIdx * 0.1}s` }}
                  >
                    <button
                      onClick={() => setExpandedGroup(isGExpanded ? null : group.id)}
                      className="w-full p-5 sm:p-6 text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Group name + badges */}
                          <div className="flex items-center gap-3 flex-wrap mb-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${group.color} flex items-center justify-center shadow-lg`}>
                              <span className="material-symbols-outlined text-white text-lg">{group.icon}</span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold">{group.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${signalColors[group.growthSignal]}`}>
                              {signalLabels[group.growthSignal]}
                            </span>
                          </div>

                          <p className="text-xs text-on-surface-variant mb-3">{group.description}</p>

                          {/* Stats */}
                          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-on-surface-variant text-sm">visibility</span>
                              <span className="text-sm font-black text-on-surface">
                                <AnimatedNumber value={group.totalViews} />
                              </span>
                              <span className="text-[10px] text-on-surface-variant">views</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-on-surface-variant text-sm">movie</span>
                              <span className="text-sm font-bold text-on-surface">{group.videoCount}</span>
                              <span className="text-[10px] text-on-surface-variant">videos</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-on-surface-variant text-sm">group</span>
                              <span className="text-sm font-bold text-on-surface">{group.creatorCount}</span>
                              <span className="text-[10px] text-on-surface-variant">creators</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-on-surface-variant">avg:</span>
                              <span className="text-xs font-bold text-primary-container">{formatMetric(group.avgViews)}/video</span>
                            </div>
                          </div>

                          {/* Related hashtags */}
                          <div className="flex flex-wrap gap-1 mt-3">
                            {group.relatedHashtags.slice(0, 6).map((rh) => (
                              <span key={rh.tag} className="px-2 py-0.5 rounded bg-surface-container-highest/60 text-[10px] font-bold text-on-surface-variant border border-outline-variant/10">
                                {rh.tag} <span className="text-primary-container/60">×{rh.count}</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Score + expand */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="text-right">
                            <span className="text-2xl font-black text-primary-container">{group.trendScore}</span>
                            <p className="text-[9px] text-on-surface-variant uppercase tracking-wider">Score</p>
                          </div>
                          <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${isGExpanded ? "rotate-180" : ""}`}>
                            expand_more
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Expanded: Top Creators + Top Videos */}
                    {isGExpanded && (
                      <div className="border-t border-outline-variant/10 animate-fade-in-up">
                        {/* Top Creators row */}
                        <div className="px-5 sm:px-6 pt-4 pb-3">
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Top Creators</p>
                          <div className="flex flex-wrap gap-3">
                            {group.topCreators.map((tc, ci) => (
                              <div key={tc.username} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container border border-outline-variant/10 animate-fade-in-up" style={{animationDelay: `${ci * 0.05}s`}}>
                                {tc.avatar_url ? (
                                  <img src={tc.avatar_url} alt={tc.username} className="w-7 h-7 rounded-full object-cover ring-1 ring-outline-variant/20" />
                                ) : (
                                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${hashColor(tc.username)} flex items-center justify-center text-[8px] font-bold text-white`}>
                                    {getInitials(tc.username)}
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs font-bold">@{tc.username}</p>
                                  <p className="text-[10px] text-on-surface-variant">{formatMetric(tc.views)} views</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Videos grid */}
                        <div className="px-5 sm:px-6 pt-2 pb-5 sm:pb-6">
                          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Top Videos</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                            {group.topVideos.slice(0, 6).map((video, vIdx) => (
                              <a
                                key={video.url}
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group rounded-lg border border-outline-variant/10 bg-surface-container overflow-hidden hover:border-primary-container/20 transition-all hover:shadow-lg hover:shadow-primary-container/5 animate-fade-in-up"
                                style={{ animationDelay: `${vIdx * 0.08}s` }}
                              >
                                <div className="relative aspect-[3/4] bg-surface-container-highest overflow-hidden">
                                  {video.thumbnail_url ? (
                                    <img
                                      src={video.thumbnail_url}
                                      alt={video.description || "Video"}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container-highest to-surface-container">
                                      <span className={`material-symbols-outlined text-2xl opacity-30`}>{group.icon}</span>
                                    </div>
                                  )}
                                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
                                    <span className="material-symbols-outlined text-white text-[10px]">visibility</span>
                                    <span className="text-[10px] font-bold text-white">{formatMetric(video.views)}</span>
                                  </div>
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <span className="material-symbols-outlined text-white text-2xl">play_arrow</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${hashColor(video.creator)} flex items-center justify-center text-[7px] font-bold text-white`}>
                                      {getInitials(video.creator)}
                                    </div>
                                    <span className="text-[11px] font-bold truncate">@{video.creator}</span>
                                  </div>
                                  <p className="text-[10px] text-on-surface-variant line-clamp-2">{video.description || "—"}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ HASHTAGS SECTION ═══ */}
          {activeSection === "hashtags" && (
          <div className="space-y-4">
            {sortedTrends.map((trend, idx) => {
              const isExpanded = expandedHashtag === trend.hashtag;
              const videos = hashtagVideos[trend.hashtag] || [];
              const growthPct = Math.round(trend.freshness * 500);
              const isVisible = idx < visibleCards;

              return (
                <div
                  key={trend.hashtag}
                  className={`rounded-2xl border transition-all duration-500 overflow-hidden ${
                    isVisible ? "animate-fade-in-up" : "opacity-0"
                  } ${
                    isExpanded
                      ? "border-primary-container/30 bg-surface-container-low shadow-[0_0_40px_rgba(0,229,255,0.06)]"
                      : "border-outline-variant/10 bg-surface-container-low/60 hover:border-outline-variant/25"
                  }`}
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {/* Hashtag Header */}
                  <button
                    onClick={() => setExpandedHashtag(isExpanded ? null : trend.hashtag)}
                    className="w-full p-3 sm:p-5 md:p-6 text-left"
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Rank badge + Hashtag */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-2 sm:mb-3">
                          <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-lg text-[10px] sm:text-xs font-black ${
                            trend.rank === 1 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                            trend.rank === 2 ? "bg-gray-400/15 text-gray-300 border border-gray-400/25" :
                            trend.rank === 3 ? "bg-orange-600/15 text-orange-400 border border-orange-600/25" :
                            "bg-surface-container-highest text-on-surface-variant border border-outline-variant/20"
                          }`}>
                            #{trend.rank}
                          </span>
                          <h3 className="text-base sm:text-xl md:text-2xl font-bold">{trend.hashtag}</h3>
                          {trend.rank <= 3 && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/25">
                              HOT
                            </span>
                          )}
                          {trend.freshness > 0.4 && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Rising
                            </span>
                          )}
                        </div>

                        {/* Stats row with animated numbers */}
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-5 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-on-surface-variant text-sm">visibility</span>
                            <span className="text-sm font-black text-on-surface">
                              <AnimatedNumber value={trend.total_views} />
                            </span>
                            <span className="text-[10px] text-on-surface-variant">views</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-on-surface-variant text-sm">group</span>
                            <span className="text-sm font-bold text-on-surface">{trend.creator_count}</span>
                            <span className="text-[10px] text-on-surface-variant">creators</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-on-surface-variant text-sm">movie</span>
                            <span className="text-sm font-bold text-on-surface">{trend.video_count}</span>
                            <span className="text-[10px] text-on-surface-variant">videos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-emerald-400 text-sm">trending_up</span>
                            <span className="text-xs font-bold text-emerald-400">+{growthPct}%</span>
                          </div>
                        </div>

                        {/* Trend score bar */}
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Score</span>
                          <div className="flex-1 max-w-48 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary-container to-[#6d11ad] animate-expand-width"
                              style={{ "--target-width": `${Math.min((trend.trend_score / (sortedTrends[0]?.trend_score || 1)) * 100, 100)}%` } as React.CSSProperties}
                            />
                          </div>
                          <span className="text-xs font-black text-primary-container">{trend.trend_score}</span>
                        </div>
                      </div>

                      {/* Right side: TikTok link + sparkline + expand */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <a
                          href={`https://www.tiktok.com/tag/${trend.hashtag.replace("#", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-surface-container-highest/60 hover:bg-primary-container/15 hover:text-primary-container transition-all border border-outline-variant/10"
                          title={`View ${trend.hashtag} on TikTok`}
                        >
                          <svg width="14" height="14" viewBox="0 0 48 48" fill="none" className="opacity-70">
                            <path d="M38.4 20.2c-2.8.2-5.4-.7-7.4-2.4v11c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10c.5 0 1 0 1.5.1v5c-.5-.1-1-.2-1.5-.2-2.8 0-5 2.2-5 5s2.2 5 5 5c2.8 0 5.2-2.1 5.2-5V4h4.8c.4 4.2 3.8 7.5 8 7.7v8.5h-.1z" fill="currentColor"/>
                          </svg>
                          <span className="hidden sm:inline">View</span>
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </a>
                        <div className="w-20 h-10 hidden sm:block">
                          <svg className="w-full h-full" viewBox="0 0 80 32">
                            <path
                              d={`M0,28 Q${10 + trend.rank * 2},${24 - trend.freshness * 8} ${25},${20 - trend.freshness * 4} T${50},${12 - trend.rank} T80,${4 + trend.rank}`}
                              fill="none"
                              stroke="#00e5ff"
                              strokeWidth="1.5"
                              opacity="0.8"
                            />
                            <path
                              d={`M0,28 Q${10 + trend.rank * 2},${24 - trend.freshness * 8} ${25},${20 - trend.freshness * 4} T${50},${12 - trend.rank} T80,${4 + trend.rank} V32 H0 Z`}
                              fill="url(#sparkGrad)"
                              opacity="0.15"
                            />
                            <defs>
                              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00e5ff" />
                                <stop offset="100%" stopColor="transparent" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                        <span
                          className={`material-symbols-outlined text-on-surface-variant transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          expand_more
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded: Visual Evidence */}
                  {isExpanded && (
                    <div className="border-t border-outline-variant/10 animate-fade-in-up">
                      <div className="px-5 sm:px-6 pt-4 pb-2">
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                          Visual Evidence
                        </p>
                      </div>

                      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                          {(videos.length > 0
                            ? videos.slice(0, 6)
                            : trend.sample_videos.map((sv) => ({
                                url: sv.url,
                                description: "",
                                views: sv.views,
                                likes: 0,
                                shares: 0,
                                postedAt: sv.posted,
                                dateText: "",
                                thumbnail_url: null as string | null,
                                creator_username: sv.creator.replace("@", ""),
                                creator_avatar: null as string | null,
                              }))
                          ).map((video, vIdx) => (
                            <div
                              key={video.url}
                              className="group rounded-lg border border-outline-variant/10 bg-surface-container overflow-hidden hover:border-primary-container/20 transition-all hover:shadow-lg hover:shadow-primary-container/5 animate-fade-in-up"
                              style={{ animationDelay: `${vIdx * 0.1}s` }}
                            >
                              {/* Thumbnail */}
                              <div className="relative aspect-[3/4] bg-surface-container-highest overflow-hidden">
                                {video.thumbnail_url ? (
                                  <img
                                    src={video.thumbnail_url}
                                    alt={video.description || "Video thumbnail"}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      target.nextElementSibling?.classList.remove("hidden");
                                    }}
                                  />
                                ) : null}
                                <div
                                  className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-container-highest to-surface-container ${video.thumbnail_url ? "hidden" : ""}`}
                                >
                                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-30 mb-2">
                                    <path
                                      d="M38.4 20.2c-2.8.2-5.4-.7-7.4-2.4v11c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10c.5 0 1 0 1.5.1v5c-.5-.1-1-.2-1.5-.2-2.8 0-5 2.2-5 5s2.2 5 5 5c2.8 0 5.2-2.1 5.2-5V4h4.8c.4 4.2 3.8 7.5 8 7.7v8.5h-.1z"
                                      fill="currentColor"
                                      className="text-on-surface-variant"
                                    />
                                  </svg>
                                  <span className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider">Safe Preview</span>
                                </div>

                                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5">
                                  <span className="material-symbols-outlined text-white text-[10px]">visibility</span>
                                  <span className="text-[10px] font-bold text-white">{formatMetric(video.views)}</span>
                                </div>

                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-white text-2xl">play_arrow</span>
                                  </div>
                                </div>
                              </div>

                              {/* Creator info */}
                              <div className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  {video.creator_avatar ? (
                                    <img
                                      src={video.creator_avatar}
                                      alt={video.creator_username}
                                      className="w-6 h-6 rounded-full object-cover ring-1 ring-outline-variant/20"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        target.nextElementSibling?.classList.remove("hidden");
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${hashColor(video.creator_username)} flex items-center justify-center text-[8px] font-bold text-white ${video.creator_avatar ? "hidden" : ""}`}
                                  >
                                    {getInitials(video.creator_username)}
                                  </div>
                                  <span className="text-xs font-bold truncate">@{video.creator_username}</span>
                                </div>

                                <div className="flex items-center gap-2 text-[10px] text-on-surface-variant mb-2">
                                  {video.postedAt && <span>{timeAgo(video.postedAt)}</span>}
                                  {video.likes > 0 && (
                                    <span className="flex items-center gap-0.5">
                                      <span className="text-red-400">♥</span> {formatMetric(video.likes)}
                                    </span>
                                  )}
                                </div>

                                {/* Product badges */}
                                {"products" in video && (video as HashtagVideo).products && (video as HashtagVideo).products!.length > 0 && (
                                  <div className="mb-2 space-y-1">
                                    {(video as HashtagVideo).products!.slice(0, 2).map((prod, pi) => (
                                      <a
                                        key={pi}
                                        href={prod.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                                      >
                                        {prod.image && (
                                          <img src={prod.image} alt={prod.name} className="w-5 h-5 rounded object-cover" />
                                        )}
                                        <span className="text-[10px] font-bold text-amber-300 truncate flex-1">{prod.name}</span>
                                        {prod.price && (
                                          <span className="text-[9px] font-black text-amber-400">{prod.price}</span>
                                        )}
                                        <span className="material-symbols-outlined text-amber-400 text-[10px]">shopping_bag</span>
                                      </a>
                                    ))}
                                  </div>
                                )}

                                <a
                                  href={video.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-bold bg-surface-container-highest/60 hover:bg-primary-container/15 hover:text-primary-container transition-all border border-outline-variant/10"
                                >
                                  Watch Video
                                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>

                        {videos.length > 6 && (
                          <div className="mt-4 text-center">
                            <span className="text-xs text-on-surface-variant">
                              +{videos.length - 6} more videos with this hashtag
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
        </>
      )}
    </div>
  );
}
