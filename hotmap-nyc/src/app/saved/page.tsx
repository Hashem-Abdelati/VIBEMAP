'use client';
// src/app/saved/page.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, MapPin, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { PingModal } from '@/components/pings/PingModal';
import { useAuthStore } from '@/lib/store';
import { useMapStore } from '@/lib/store';
import { CATEGORY_COLORS, CATEGORY_LABELS, CROWD_LABELS } from '@/types';

export default function SavedPage() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="pt-14">
        <SavedContent />
      </div>
      <PingModal />
    </AuthProvider>
  );
}

function SavedContent() {
  const { user } = useAuthStore();
  const { openPingModal } = useMapStore();
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/users/saved')
      .then(r => r.json())
      .then(d => { if (d.success) setSaved(d.data.saved); })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Bookmark className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl text-text-primary mb-2">Save your go-to spots</h2>
        <p className="text-text-secondary text-sm mb-6">Sign in to bookmark places and get notified when they're trending.</p>
        <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-text-primary mb-2">Saved Places</h1>
        <p className="text-text-secondary text-sm">{saved.length} places saved · Get notified when they're trending</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-32 animate-pulse" />
          ))}
        </div>
      ) : saved.length === 0 ? (
        <div className="text-center py-20">
          <Bookmark className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-text-primary mb-2">No saved places yet</h3>
          <p className="text-text-secondary text-sm mb-6">Explore the map and save spots you love.</p>
          <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Explore Map
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {saved.map((s: any) => {
            const place = s.place;
            const catColor = CATEGORY_COLORS[place.category] || '#F59E0B';
            const crowdLevel = Math.round(place.avgCrowdLevel || 1);
            const crowdInfo = CROWD_LABELS[crowdLevel] || CROWD_LABELS[1];
            const isTrending = (place.trendVelocity || 0) > 2;
            const recentPing = place.pings?.[0];

            return (
              <div key={s.id} className="card hover:border-accent/20 transition-all">
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${catColor}, ${catColor}44)` }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge text-[10px]" style={{ background: `${catColor}15`, color: catColor }}>
                          {CATEGORY_LABELS[place.category]}
                        </span>
                        {isTrending && <span className="badge bg-accent/10 text-accent text-[10px] border border-accent/20">🔥 Trending</span>}
                      </div>
                      <Link href={`/place/${place.id}`} className="font-display font-bold text-lg text-text-primary hover:text-accent transition-colors block truncate">
                        {place.name}
                      </Link>
                      <p className="text-text-muted text-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {place.neighborhood}
                      </p>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => openPingModal(place.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl text-sm font-semibold border border-accent/20"
                      >
                        <Zap className="w-3.5 h-3.5" /> Ping
                      </button>
                    </div>
                  </div>

                  {/* Crowd level */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: crowdInfo.color }} />
                      <span className="text-xs" style={{ color: crowdInfo.color }}>{crowdInfo.label}</span>
                    </div>
                    {recentPing?.vibeTags && (
                      <span className="text-xs text-text-muted">
                        {recentPing.vibeTags.slice(0, 2).map((t: string) => t.replace(/_/g, ' ')).join(' · ')}
                      </span>
                    )}
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
