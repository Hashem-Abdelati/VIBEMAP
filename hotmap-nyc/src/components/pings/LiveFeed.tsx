'use client';
import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp } from 'lucide-react';
import { Ping, CATEGORY_COLORS } from '@/types';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

interface LiveFeedProps {
  limit?: number;
  placeId?: string;
  title?: string;
}

export function LiveFeed({ limit = 15, placeId, title = 'Live feed' }: LiveFeedProps) {
  const { user } = useAuthStore();
  const [pings, setPings] = useState<Ping[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams({ limit: String(limit), live: 'true' });
      if (placeId) p.set('placeId', placeId);
      const r = await fetch(`/api/pings?${p}`);
      const d = await r.json();
      if (d.success) setPings(d.data.pings);
    } catch {}
    setLoading(false);
  }, [limit, placeId]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const vote = async (pingId: string) => {
    if (!user) { window.location.href = '/auth/login'; return; }
    await fetch(`/api/pings/${pingId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ helpful: true }),
    });
    setPings(p => p.map(x => x.id === pingId ? { ...x, upvotes: x.upvotes + 1, userVote: true } : x));
  };

  if (loading) return (
    <div className="space-y-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="panel-inset rounded-sm h-16 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="live-indicator" />
        <span className="text-ghost text-xs font-medium">{title}</span>
        <span className="label-caps text-live border border-live/20 bg-live/5 px-1.5 py-0.5 rounded-sm">Live</span>
      </div>

      {pings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-mid text-sm">No recent pings</p>
          <p className="text-dim text-xs mt-1">Be first to report</p>
        </div>
      ) : (
        <div className="space-y-px">
          {pings.map(ping => {
            const color = ping.place ? (CATEGORY_COLORS[ping.place.category] || '#C8923A') : '#C8923A';
            return (
              <div key={ping.id}
                className="panel-inset hover:bg-ink-3 rounded-sm px-3 py-3 transition-colors group">
                <div className="flex items-start gap-2.5">
                  <div className="cat-dot mt-1 flex-shrink-0" style={{ background: color }} />
                  <div className="flex-1 min-w-0">
                    {/* Place */}
                    {ping.place && (
                      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                        <Link href={`/place/${ping.placeId}`}
                          className="text-ghost text-xs font-medium hover:text-pulse transition-colors truncate max-w-[130px]">
                          {ping.place.name}
                        </Link>
                        {ping.place.neighborhood && (
                          <span className="text-dim text-xs truncate">{ping.place.neighborhood}</span>
                        )}
                      </div>
                    )}
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {ping.vibeTags.slice(0, 4).map(tag => (
                        <span key={tag}
                          className="text-2xs px-1.5 py-0.5 rounded-sm bg-ink-4 text-mid border border-wire">
                          {tag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                    {/* Note */}
                    {ping.note && (
                      <p className="text-xs text-mid italic mb-1.5 leading-relaxed">"{ping.note}"</p>
                    )}
                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="mono text-dim">
                        {formatDistanceToNow(new Date(ping.createdAt), { addSuffix: true })}
                      </span>
                      <button onClick={() => vote(ping.id)}
                        className={`flex items-center gap-1 text-2xs px-2 py-1 rounded-sm transition-all ${
                          ping.userVote
                            ? 'text-live bg-live/10'
                            : 'text-dim hover:text-live hover:bg-live/10 opacity-0 group-hover:opacity-100'
                        }`}>
                        <ThumbsUp size={10} />
                        {ping.upvotes > 0 && ping.upvotes}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}