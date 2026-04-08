"use client";

import { useEffect, useState, useRef } from "react";

interface StatsBarProps {
  totalCreators: number;
  totalVideos: number;
  totalViews: string;
}

function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(target);
  const mounted = useRef(false);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; setValue(target); return; }
    startTime.current = null;
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const elapsed = ts - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return <>{value}</>;
}

function parseViewStr(s: string): number {
  const clean = s.replace(/,/g, "").trim();
  if (clean.endsWith("M")) return Math.round(parseFloat(clean) * 1_000_000);
  if (clean.endsWith("K")) return Math.round(parseFloat(clean) * 1_000);
  return Math.round(parseFloat(clean)) || 0;
}

function formatMetric(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function AnimatedMetric({ target, duration = 1500 }: { target: string; duration?: number }) {
  const num = parseViewStr(target);
  const [value, setValue] = useState(num);
  const mounted = useRef(false);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!mounted.current) { mounted.current = true; setValue(num); return; }
    startTime.current = null;
    const animate = (ts: number) => {
      if (!startTime.current) startTime.current = ts;
      const elapsed = ts - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(num * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [num, duration]);

  return <>{formatMetric(value)}</>;
}

export default function StatsBar({ totalCreators, totalVideos, totalViews }: StatsBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      label: "Active Creators",
      value: totalCreators,
      type: "number" as const,
      icon: "group",
      color: "text-primary-container",
      delay: 0,
    },
    {
      label: "Total Videos",
      value: totalVideos,
      type: "number" as const,
      icon: "movie",
      color: "text-on-surface",
      delay: 0.1,
    },
    {
      label: "Total Views",
      value: totalViews,
      type: "metric" as const,
      icon: "visibility",
      color: "text-secondary",
      delay: 0.2,
    },
    {
      label: "Platform",
      value: "Social",
      type: "text" as const,
      icon: "public",
      color: "text-on-surface",
      delay: 0.3,
    },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`glass-card p-5 rounded-xl border border-outline-variant/10 transition-all duration-500 ${
            visible ? "animate-fade-in-up" : "opacity-0"
          }`}
          style={{ animationDelay: `${stat.delay}s` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-on-surface-variant text-sm">{stat.icon}</span>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">
              {stat.label}
            </p>
          </div>
          <h3 className={`font-headline text-2xl font-bold ${stat.color} animate-count-up`}>
            {stat.type === "number" ? (
              <AnimatedCounter target={stat.value as number} />
            ) : stat.type === "metric" ? (
              <AnimatedMetric target={stat.value as string} />
            ) : (
              stat.value
            )}
          </h3>
        </div>
      ))}
    </section>
  );
}
