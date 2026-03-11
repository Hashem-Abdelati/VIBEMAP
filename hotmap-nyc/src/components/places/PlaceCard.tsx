'use client';
import { useState } from 'react';
import { Bookmark, BookmarkCheck, Zap } from 'lucide-react';
import { Place, CATEGORY_COLORS } from '@/types';
import { useAuthStore } from '@/lib/store';
import { useMapStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';

const CAT_LABEL: Record<string, string> = {
  COFFEE: 'Coffee', STUDY: 'Study', LIBRARY: 'Library',
  GYM: 'Gym', BAR: 'Bar', FOOD: 'Food', PARK: 'Park',
};

const CROWD_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: 'Empty',    color: '#4ECBA0' },
  2: { label: 'Light',    color: '#82C87A' },
  3: { label: 'Moderate', color: '#D4B85A' },
  4: { label: 'Busy',     color: '#D4834A' },
  5: { label: 'Packed',   color: '#C85050' },
};

interface PlaceCardProps {
  place: Place;
  onSelect?: () => void;
}

export function PlaceCard({ place, onSelect }: PlaceCardProps) {
  const { user } = useAuthStore();
  const { openPingModal } = useMapStore();
  const [saved, setSaved] = useState(place.isSaved || false);
  const [saving, setSaving] = useState(false);

  const crowdLevel = Math.round(place.avgCrowdLevel || 1) as 1|2|3|4|5;
  const crowd = CROWD_LABEL[crowdLevel] || CROWD_LABEL[1];
  const catColor = CATEGORY_COLORS[place.category] || '#C8923A';
  const trending = (place.trendVelocity || 0) > 2;
  const recentPing = place.recentPings?.[0];

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { window.location.href = '/auth/login'; return; }
    setSaving(true);
    try {
      const r = await fetch(`/api/places/${place.id}/save`, { method: 'POST' });
      const d = await r.json();
      if (d.success) setSaved(d.data.saved);
    } finally { setSaving(false); }
  };

  const handlePing = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) { window.location.href = '/auth/login'; return; }
    openPingModal(place.id);
  };

  return (
    <div
      onClick={onSelect}
      className="group panel rounded-sm hover:border-wire-2 cursor-pointer transition-all duration-150 animate-fade-up"
    >
      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: catColor }} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2 mb-1.5">
              <div className="cat-dot" style={{ background: catColor }} />
              <span className="label-caps" style={{ color: catColor }}>
                {CAT_LABEL[place.category]}
              </span>
              {trending && (
                <span className="label-caps" style={{ color: '#C8923A', borderColor: '#C8923A40', background: '#C8923A10' }}
                  className="tag">
                  Trending
                </span>
              )}
            </div>

            <h3 className="text-ghost font-medium text-sm leading-snug truncate">
              {place.name}
            </h3>
            <p className="text-dim text-xs mt-0.5 truncate">
              {place.neighborhood}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={handlePing}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-sm border border-pulse/30 text-pulse bg-pulse/8 hover:bg-pulse/15 transition-all">
              <Zap size={11} />
              Ping
            </button>
            <button onClick={handleSave} disabled={saving}
              className={`p-1.5 rounded-sm border transition-all ${
                saved
                  ? 'border-pulse/30 text-pulse bg-pulse/8'
                  : 'border-wire text-dim hover:border-wire-2 hover:text-pale'
              }`}>
              {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            </button>
          </div>
        </div>

        {/* Crowd + noise row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: crowd.color }} />
            <span className="text-xs" style={{ color: crowd.color }}>{crowd.label}</span>
          </div>

          {place.avgNoiseLevel && (
            <>
              <span className="text-wire">·</span>
              <span className="text-xs text-dim">
                {place.avgNoiseLevel <= 2 ? 'Quiet' : place.avgNoiseLevel <= 3 ? 'Moderate' : 'Loud'}
              </span>
            </>
          )}

          {place.avgWifiScore && place.avgWifiScore > 3 && (
            <>
              <span className="text-wire">·</span>
              <span className="text-xs text-dim">WiFi</span>
            </>
          )}
        </div>

        {/* Recent ping */}
        {recentPing && (
          <div className="panel-inset rounded-sm px-3 py-2">
            <div className="flex items-start gap-2">
              <div className="live-indicator mt-1 flex-shrink-0" style={{ width: 5, height: 5 }} />
              <div className="flex-1 min-w-0">
                {recentPing.note ? (
                  <p className="text-xs text-mid leading-relaxed truncate">"{recentPing.note}"</p>
                ) : (
                  <p className="text-xs text-mid">
                    {recentPing.vibeTags.slice(0, 3).map(t => t.replace(/_/g, ' ')).join('  ·  ')}
                  </p>
                )}
                <span className="mono text-dim mt-0.5 block">
                  {formatDistanceToNow(new Date(recentPing.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}