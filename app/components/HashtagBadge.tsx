"use client";

export default function HashtagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-block px-2 py-0.5 bg-primary-container/10 text-primary-container rounded text-[10px] font-bold border border-primary-container/20">
      {tag}
    </span>
  );
}
