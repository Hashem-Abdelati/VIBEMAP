'use client';
import { Flame } from 'lucide-react';
import { useMapStore } from '@/lib/store';

const CATEGORIES = [
  { id: 'COFFEE',  label: 'Coffee'  },
  { id: 'STUDY',   label: 'Study'   },
  { id: 'LIBRARY', label: 'Library' },
  { id: 'GYM',     label: 'Gym'     },
  { id: 'BAR',     label: 'Bar'     },
  { id: 'FOOD',    label: 'Food'    },
  { id: 'PARK',    label: 'Park'    },
];

// Muted accent per category — no loud colors
const CAT_COLOR: Record<string, string> = {
  COFFEE:  '#C8923A',
  STUDY:   '#6B8FC8',
  LIBRARY: '#8B6BC8',
  GYM:     '#4ECBA0',
  BAR:     '#C86B8F',
  FOOD:    '#C8923A',
  PARK:    '#6BC87A',
};

export function FilterBar() {
  const { filters, toggleCategory, setShowTrending } = useMapStore();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-hide">
      {/* Trending toggle */}
      <button
        onClick={() => setShowTrending(!filters.showTrending)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium whitespace-nowrap border transition-all flex-shrink-0 ${
          filters.showTrending
            ? 'bg-pulse/10 text-pulse border-pulse/30'
            : 'bg-transparent text-dim border-wire hover:text-pale hover:border-wire-2'
        }`}
      >
        <Flame size={11} />
        Trending
      </button>

      <div className="w-px h-4 bg-wire flex-shrink-0" />

      {CATEGORIES.map(cat => {
        const active = filters.categories.includes(cat.id);
        const color  = CAT_COLOR[cat.id];
        return (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium whitespace-nowrap border transition-all flex-shrink-0"
            style={active ? {
              background: `${color}15`,
              color,
              borderColor: `${color}40`,
            } : {
              background: 'transparent',
              color: '#6B6B6B',
              borderColor: '#2E2E2E',
            }}
          >
            {/* Tiny dot instead of emoji */}
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: active ? color : '#3A3A3A' }} />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}