"use client";

interface SearchBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
}

export default function SearchBar({ search, onSearchChange, sort, onSortChange }: SearchBarProps) {
  const sortOptions = [
    { key: "followers", label: "Followers" },
    { key: "views", label: "Views" },
    { key: "videos", label: "Videos" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
      <div className="relative flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
          search
        </span>
        <input
          type="text"
          placeholder="Search creators or hashtags..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-surface-container-lowest border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary-container/40 placeholder:text-on-surface-variant/60"
        />
      </div>
      <div className="flex gap-2">
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSortChange(opt.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              sort === opt.key
                ? "bg-primary-container text-on-primary-fixed"
                : "bg-surface-container-highest/40 text-on-surface-variant border border-outline-variant/20 hover:border-primary-container/40 hover:text-primary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
