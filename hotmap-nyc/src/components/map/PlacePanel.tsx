'use client';
import { useState, useEffect } from 'react';
import { X, Bookmark, BookmarkCheck, Zap, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Place, CATEGORY_COLORS, VibeTag } from '@/types';
import { useAuthStore } from '@/lib/store';
import { useMapStore } from '@/lib/store';
import Link from 'next/link';

const CROWD_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: 'Empty',    color: '#4ECBA0' },
  2: { label: 'Light',    color: '#82C87A' },
  3: { label: 'Moderate', color: '#D4B85A' },
  4: { label: 'Busy',     color: '#D4834A' },
  5: { label: 'Packed',   color: '#C85050' },
};

export function PlacePanel({ placeId, onClose }: { placeId: string; onClose: () => void }) {
  const { user } = useAuthStore();
  const { openPingModal } = useMapStore();
  const [place, setPlace] = useState<Place | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/places/${placeId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) { setPlace(d.data.place); setSaved(d.data.place.isSaved || false); }
      })
      .finally(() => setLoading(false));
  }, [placeId]);

  const handleSave = async () => {
    if (!user) { window.location.href = '/auth/login'; return; }
    const r = await fetch(`/api/places/${placeId}/save`, { method: 'POST' });
    const d = await r.json();
    if (d.success) setSaved(d.data.saved);
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-wire border-t-pulse rounded-full animate-spin" />
    </div>
  );

  if (!place) return null;

  const catColor = CATEGORY_COLORS[place.category] || '#C8923A';
  const crowdLevel = Math.round(place.avgCrowdLevel || 1) as 1|2|3|4|5;
  const crowd = CROWD_LABEL[crowdLevel] || CROWD_LABEL[1];
  const trending = (place.trendVelocity || 0) > 2;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-wire">
        {/* Category + close */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="cat-dot" style={{ background: catColor }} />
            <span className="label-caps" style={{ color: catColor }}>
              {place.category.toLowerCase()}
            </span>
            {trending && (
              <span className="label-caps text-pulse border border-pulse/30 bg-pulse/8 px-1.5 py-0.5 rounded-sm">
                Trending
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-ink-3 rounded-sm transition-all">
            <X size={14} className="text-dim" />
          </button>
        </div>

        <h2 className="font-display text-2xl font-light text-ghost leading-tight mb-0.5">
          {place.name}
        </h2>
        <p className="text-dim text-xs">{place.neighborhood} · {place.borough.replace('_', ' ')}</p>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button onClick={() => openPingModal(placeId)}
            className="btn btn-primary flex-1 py-2 gap-1.5 text-xs">
            <Zap size={12} /> Ping this place
          </button>
          <button onClick={handleSave}
            className={`btn py-2 px-3 text-xs border ${
              saved
                ? 'bg-pulse/10 border-pulse/30 text-pulse'
                : 'bg-transparent border-wire text-dim hover:border-wire-2 hover:text-pale'
            }`}>
            {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
          <Link href={`/place/${placeId}`}
            className="btn py-2 px-3 text-xs bg-transparent border border-wire text-dim hover:border-wire-2 hover:text-pale">
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Metrics */}
        <div className="p-4 border-b border-wire">
          <div className="label-caps mb-3">Current vibe</div>
          <div className="grid grid-cols-2 gap-1.5">
            <Metric label="Crowd" value={crowd.label} color={crowd.color}
              bar={(crowdLevel / 5) * 100} />
            {place.avgNoiseLevel && (
              <Metric label="Noise"
                value={place.avgNoiseLevel <= 2 ? 'Quiet' : place.avgNoiseLevel <= 3 ? 'Moderate' : 'Loud'}
                color={place.avgNoiseLevel <= 2 ? '#4ECBA0' : place.avgNoiseLevel <= 3 ? '#D4B85A' : '#D4834A'}
                bar={(place.avgNoiseLevel / 5) * 100} />
            )}
            {place.avgStudyScore && (
              <Metric label="Study"
                value={place.avgStudyScore >= 4 ? 'Excellent' : place.avgStudyScore >= 3 ? 'Good' : 'Decent'}
                color="#6B8FC8"
                bar={(place.avgStudyScore / 5) * 100} />
            )}
            {place.avgWifiScore && (
              <Metric label="WiFi"
                value={place.avgWifiScore >= 4 ? 'Strong' : place.avgWifiScore >= 3 ? 'Good' : 'Weak'}
                color="#4ECBA0"
                bar={(place.avgWifiScore / 5) * 100} />
            )}
          </div>
        </div>

        {/* Tags */}
        {place.tags?.length > 0 && (
          <div className="p-4 border-b border-wire">
            <div className="label-caps mb-2">Known for</div>
            <div className="flex flex-wrap gap-1.5">
              {place.tags.map(t => (
                <span key={t} className="tag text-mid border-wire">
                  {t.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent pings */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="live-indicator" style={{ width: 5, height: 5 }} />
            <div className="label-caps">Recent pings</div>
          </div>

          {place.recentPings && place.recentPings.length > 0 ? (
            <div className="space-y-px">
              {(place.recentPings as any[]).map((ping: any) => (
                <div key={ping.id} className="panel-inset rounded-sm px-3 py-2.5">
                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {ping.vibeTags.slice(0, 5).map((tag: VibeTag) => (
                      <span key={tag} className="text-2xs px-1.5 py-0.5 bg-ink-4 text-mid border border-wire rounded-sm">
                        {tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                  {ping.note && (
                    <p className="text-xs text-mid italic mb-1.5">"{ping.note}"</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="mono text-dim">
                      {formatDistanceToNow(new Date(ping.createdAt), { addSuffix: true })}
                    </span>
                    {ping.upvotes > 0 && (
                      <span className="mono text-live">{ping.upvotes} helpful</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-mid text-xs">No pings yet</p>
              <p className="text-dim text-xs mt-0.5">Be first to report</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color, bar }: { label: string; value: string; color: string; bar: number }) {
  return (
    <div className="panel-inset rounded-sm p-3">
      <div className="label-caps mb-1.5">{label}</div>
      <div className="text-sm font-medium mb-2" style={{ color }}>{value}</div>
      <div className="h-px bg-ink-4 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${bar}%`, background: color }} />
      </div>
    </div>
  );
}