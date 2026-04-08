"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Creator, TrendData } from "@/lib/parse";
import { parseMetric, formatMetric } from "@/lib/parse";
import StatsBar from "./components/StatsBar";
import CreatorCard from "./components/CreatorCard";
import TrendBoard from "./components/TrendBoard";

type Tab = "creators" | "trends";

export default function Home() {
  const [allCreators, setAllCreators] = useState<Creator[]>([]);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [sort, setSort] = useState("followers");
  const [activeTab, setActiveTab] = useState<Tab>("trends");
  const [expandedCreator, setExpandedCreator] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch all data once on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [creatorsRes, trendsRes] = await Promise.all([
          fetch("/api/creators?sort=followers"),
          fetch("/api/trends"),
        ]);
        const [creatorsData, trendsData] = await Promise.all([
          creatorsRes.json(),
          trendsRes.json(),
        ]);
        setAllCreators(creatorsData);
        setTrendData(trendsData);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Client-side sort
  const creators = useMemo(() => {
    return [...allCreators].sort((a, b) => {
      if (sort === "followers") {
        return parseMetric(b.profile?.followers || "0") - parseMetric(a.profile?.followers || "0");
      } else if (sort === "views") {
        const aViews = a.videos?.reduce((s, v) => s + parseMetric(v.views || "0"), 0) || 0;
        const bViews = b.videos?.reduce((s, v) => s + parseMetric(v.views || "0"), 0) || 0;
        return bViews - aViews;
      } else {
        return (b.videosCount || b.videos?.length || 0) - (a.videosCount || a.videos?.length || 0);
      }
    });
  }, [allCreators, sort]);

  const totalCreators = allCreators.length;
  const totalVideos = allCreators.reduce((sum, c) => sum + (c.videosCount || c.videos?.length || 0), 0);
  const totalViews = allCreators.reduce(
    (sum, c) => sum + c.videos.reduce((vs, v) => vs + parseMetric(v.views), 0),
    0
  );

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "creators", label: "Creators", icon: "group" },
    { key: "trends", label: "Trends", icon: "trending_up" },
  ];

  const sidebarNavItems = [
    { key: "trends" as Tab, label: "Trends Explorer", icon: "trending_up" },
    { key: "creators" as Tab, label: "Creators", icon: "group" },
  ];

  return (
    <>
      {/* Top Nav */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 lg:px-8 py-4 bg-[#0b1326]/80 backdrop-blur-xl font-headline tracking-tight">
        <div className="flex items-center gap-4 lg:gap-8">
          <button
            className="lg:hidden p-1 text-on-surface-variant"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#00e5ff" strokeWidth="1.5" opacity="0.25"/>
              <circle cx="20" cy="20" r="12" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5"/>
              <circle cx="20" cy="20" r="6" stroke="#00e5ff" strokeWidth="2" opacity="0.8"/>
              <circle cx="20" cy="20" r="2.5" fill="#00e5ff"/>
              <line x1="20" y1="20" x2="20" y2="4" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
              <line x1="20" y1="20" x2="31" y2="12" stroke="#6d11ad" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
            </svg>
            <span className="text-xl lg:text-2xl font-bold tracking-tighter text-primary-container">
              TrendHunter
            </span>
          </div>
          <nav className="hidden md:flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`transition-colors ${
                  activeTab === tab.key
                    ? "text-primary-container font-bold border-b-2 border-primary-container pb-1"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00e5ff]/20 to-[#6d11ad]/20 border border-[#00e5ff]/30 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="12" stroke="#00e5ff" strokeWidth="2.5" opacity="0.6"/>
              <circle cx="20" cy="20" r="5" fill="#00e5ff"/>
              <line x1="20" y1="20" x2="20" y2="6" stroke="#00e5ff" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-surface-container-low z-40 p-6 pt-24 space-y-8 shadow-[20px_0_32px_rgba(0,0,0,0.3)] border-r border-outline-variant/15 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" stroke="#00e5ff" strokeWidth="1.5" opacity="0.25"/>
              <circle cx="20" cy="20" r="12" stroke="#00e5ff" strokeWidth="1.5" opacity="0.5"/>
              <circle cx="20" cy="20" r="6" stroke="#00e5ff" strokeWidth="2" opacity="0.8"/>
              <circle cx="20" cy="20" r="2.5" fill="#00e5ff"/>
              <line x1="20" y1="20" x2="20" y2="4" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
              <line x1="20" y1="20" x2="31" y2="12" stroke="#6d11ad" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
            </svg>
            <h2 className="font-headline text-xl font-bold text-primary-container">TrendHunter</h2>
          </div>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-relaxed">
            #1 Trend Detection Agent
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarNavItems.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:translate-x-1 text-left ${
                activeTab === item.key
                  ? "bg-surface-container-highest text-primary-container shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={
                  activeTab === item.key
                    ? { fontVariationSettings: "'FILL' 1" }
                    : undefined
                }
              >
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-outline-variant/15">
          <div className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">
            Data updated {new Date().toLocaleDateString()}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-24 px-3 sm:px-4 lg:px-6 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="flex flex-col items-center gap-6">
                {/* Radar animation */}
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="36" stroke="#00e5ff" strokeWidth="1" opacity="0.15" fill="none"/>
                    <circle cx="40" cy="40" r="24" stroke="#00e5ff" strokeWidth="1" opacity="0.25" fill="none"/>
                    <circle cx="40" cy="40" r="12" stroke="#00e5ff" strokeWidth="1" opacity="0.4" fill="none"/>
                    <circle cx="40" cy="40" r="3" fill="#00e5ff" opacity="0.8"/>
                  </svg>
                  <div className="absolute inset-0 animate-radar-sweep" style={{transformOrigin: '50% 50%'}}>
                    <svg className="w-full h-full" viewBox="0 0 80 80">
                      <line x1="40" y1="40" x2="40" y2="4" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
                      <path d="M40,40 L40,4 A36,36 0 0,1 62,14 Z" fill="url(#radarSweepGrad)" opacity="0.3"/>
                      <defs>
                        <linearGradient id="radarSweepGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.5"/>
                          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  {/* Blips */}
                  <div className="absolute top-[25%] left-[65%] w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-data-dot" />
                  <div className="absolute top-[55%] left-[20%] w-1 h-1 rounded-full bg-[#c77dff] animate-data-dot" style={{animationDelay: '0.5s'}} />
                  <div className="absolute top-[35%] left-[40%] w-1 h-1 rounded-full bg-[#00e5ff] animate-data-dot" style={{animationDelay: '1s'}} />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-on-surface text-sm font-bold font-headline">Scanning Social Signals</p>
                  <div className="flex items-center gap-1 justify-center">
                    <span className="text-on-surface-variant text-xs">Analyzing social signals</span>
                    <span className="inline-flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-primary-container animate-data-dot" />
                      <span className="w-1 h-1 rounded-full bg-primary-container animate-data-dot" style={{animationDelay:'0.3s'}} />
                      <span className="w-1 h-1 rounded-full bg-primary-container animate-data-dot" style={{animationDelay:'0.6s'}} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Stats */}
              <StatsBar
                totalCreators={totalCreators}
                totalVideos={totalVideos}
                totalViews={formatMetric(totalViews)}
              />

              {/* Tab Buttons (mobile) */}
              <div className="flex gap-2 md:hidden">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                      activeTab === tab.key
                        ? "bg-primary-container text-on-primary-fixed"
                        : "bg-surface-container-highest/40 text-on-surface-variant border border-outline-variant/20"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "creators" ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  {/* Creator Feed */}
                  <div className="xl:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-headline text-2xl font-bold">Creator Network</h2>
                        <p className="text-on-surface-variant text-sm">
                          {totalCreators} tracked creators with {totalVideos} videos
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">Sort by</span>
                      {["followers", "views", "videos"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSort(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            sort === s
                              ? "bg-primary-container/20 text-primary-container"
                              : "text-on-surface-variant hover:text-on-surface bg-surface-container-highest/30"
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {creators.map((creator, idx) => (
                        <CreatorCard
                          key={creator.username}
                          creator={creator}
                          rank={idx + 1}
                          isExpanded={expandedCreator === creator.username}
                          onToggle={() =>
                            setExpandedCreator(
                              expandedCreator === creator.username ? null : creator.username
                            )
                          }
                        />
                      ))}
                      {creators.length === 0 && (
                        <div className="text-center py-12 text-on-surface-variant">
                          <span className="material-symbols-outlined text-4xl block mb-2">
                            search_off
                          </span>
                          No creators found matching your search.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right sidebar */}
                  <aside className="xl:col-span-4 space-y-6">
                    {trendData && trendData.trends.length > 0 && (
                      <div className="glass-card rounded-xl border border-outline-variant/10 p-6">
                        <h3 className="font-headline text-lg font-bold mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary">
                            bar_chart
                          </span>
                          Trending Hashtags
                        </h3>
                        <div className="space-y-3">
                          {trendData.trends.slice(0, 5).map((trend) => (
                            <div
                              key={trend.hashtag}
                              className="flex items-center justify-between p-3 bg-surface-container rounded-xl border border-outline-variant/5 hover:border-primary-container/20 transition-all cursor-pointer"
                              onClick={() => {
                                setActiveTab("creators");
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={`text-lg font-black w-5 text-center ${
                                    trend.rank === 1
                                      ? "text-tertiary-container"
                                      : trend.rank === 2
                                        ? "text-on-surface-variant"
                                        : "text-tertiary-fixed-dim"
                                  }`}
                                >
                                  {trend.rank}
                                </span>
                                <div>
                                  <p className="text-sm font-bold">{trend.hashtag}</p>
                                  <p className="text-[10px] text-on-surface-variant">
                                    {trend.creator_count} creators &middot;{" "}
                                    {formatMetric(trend.total_views)} views
                                  </p>
                                </div>
                              </div>
                              <span className="material-symbols-outlined text-primary-container text-sm">
                                arrow_upward
                              </span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setActiveTab("trends")}
                          className="w-full mt-4 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors"
                        >
                          View All Trends
                        </button>
                      </div>
                    )}

                    {/* Creator Network Monitor */}
                    <div className="glass-card rounded-xl border border-outline-variant/10 flex flex-col">
                      <div className="p-6 border-b border-outline-variant/10">
                        <h2 className="font-headline text-lg font-bold flex items-center gap-3">
                          <span className="w-2 h-2 bg-primary-container rounded-full animate-pulse" />
                          Top Creators
                        </h2>
                      </div>
                      <div className="p-4 space-y-4">
                        {creators.slice(0, 5).map((c) => (
                          <div
                            key={c.username}
                            className="flex items-center justify-between cursor-pointer hover:bg-surface-container/50 rounded-xl p-2 -m-2 transition-all"
                            onClick={() => {
                              setExpandedCreator(
                                expandedCreator === c.username ? null : c.username
                              );
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-container/30 to-secondary-container/30 flex items-center justify-center text-[10px] font-bold text-on-surface">
                                {c.username.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold">@{c.username}</p>
                                <p className="text-[10px] text-on-surface-variant">
                                  {formatMetric(parseMetric(c.profile?.followers))} followers
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-on-surface">
                                {formatMetric(
                                  c.videos.reduce((s, v) => s + parseMetric(v.views), 0)
                                )}{" "}
                                views
                              </p>
                              <p className="text-[10px] text-primary-container">
                                {c.videosCount} videos
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </aside>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className="font-headline text-2xl font-bold">Trending Content Sparks</h2>
                    <p className="text-on-surface-variant text-sm">
                      Hashtag trends ranked by creator adoption and view velocity
                    </p>
                  </div>
                  <TrendBoard
                    trends={trendData?.trends || []}
                    hashtagCreators={trendData?.hashtag_creators || {}}
                    hashtagVideos={trendData?.hashtag_videos || {}}
                    executiveSummary={trendData?.executive_summary || []}
                    allCreators={creators}
                    trendGroups={trendData?.trend_groups || []}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface-container/95 backdrop-blur-xl border-t border-outline-variant/10 px-6 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex justify-around items-center z-50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${
              activeTab === tab.key
                ? "text-primary-container bg-primary-container/10"
                : "text-on-surface-variant"
            }`}
          >
            <span
              className="material-symbols-outlined text-xl"
              style={
                activeTab === tab.key
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {tab.icon}
            </span>
            <span className="text-[9px] font-bold">{tab.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
