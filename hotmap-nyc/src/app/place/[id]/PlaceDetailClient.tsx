'use client';
// src/app/place/[id]/PlaceDetailClient.tsx
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bookmark, BookmarkCheck, Zap, MapPin, Users, Volume2, Wifi, BookOpen, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { PingModal } from '@/components/pings/PingModal';
import { useAuthStore } from '@/lib/store';
import { useMapStore } from '@/lib/store';
import { Place, CATEGORY_LABELS, CATEGORY_COLORS, CROWD_LABELS, BADGE_CONFIG, TrustBadge, VIBE_TAG_LABELS, VibeTag } from '@/types';

export function PlaceDetailClient({ place }: { place: Place }) {
  return (
    <AuthProvider>
      <Navbar />
      <div className="pt-14">
        <PlaceDetailInner place={place} />
      </div>
      <PingModal />
    </AuthProvider>
  );
}

function PlaceDetailInner({ place }: { place: Place }) {
  const { user } = useAuthStore();
  const { openPingModal } = useMapStore();
  const [saved, setSaved] = useState(place.isSaved || false);

  const catColor = CATEGORY_COLORS[place.category] || '#F59E0B';
  const crowdLevel = Math.round(place.avgCrowdLevel || 1);
  const crowdInfo = CROWD_LABELS[crowdLevel] || CROWD_LABELS[1];
  const isTrending = (place.trendVelocity || 0) > 2;

  const handleSave = async () => {
    if (!user) { window.location.href = '/auth/login'; return; }
    const res = await fetch(`/api/places/${place.id}/save`, { method: 'POST' });
    const data = await res.json();
    if (data.success) setSaved(data.data.saved);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-text-muted hover:text-text-secondary text-sm mb-6 transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Map
      </Link>

      {/* Header */}
      <div className="card overflow-visible mb-6">
        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${catColor}, ${catColor}44)` }} />
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge text-xs" style={{ background: `${catColor}15`, color: catColor }}>
                  {CATEGORY_LABELS[place.category]}
                </span>
                {isTrending && (
                  <span className="badge bg-accent/10 text-accent text-xs border border-accent/20">🔥 Trending</span>
                )}
              </div>
              <h1 className="font-display font-extrabold text-3xl text-text-primary mb-1">{place.name}</h1>
              <p className="text-text-secondary flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {place.address}
              </p>
              <p className="text-text-muted text-sm mt-1">
                {place.neighborhood} · {place.borough.replace('_', ' ')}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => openPingModal(place.id)}
                className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <Zap className="w-4 h-4" /> Drop Ping
              </button>
              <button
                onClick={handleSave}
                className={`btn-secondary flex items-center gap-2 text-sm ${saved ? 'text-accent' : ''}`}
              >
                {saved ? <><BookmarkCheck className="w-4 h-4" /> Saved</> : <><Bookmark className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vibe metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard icon={<Users />} label="Crowd" value={crowdInfo.label} color={crowdInfo.color} barValue={(crowdLevel / 5) * 100} />
        {place.avgNoiseLevel && <MetricCard icon={<Volume2 />} label="Noise" value={noiseLabel(place.avgNoiseLevel)} color={noiseColor(place.avgNoiseLevel)} barValue={(place.avgNoiseLevel / 5) * 100} />}
        {place.avgStudyScore && <MetricCard icon={<BookOpen />} label="Study" value={studyLabel(place.avgStudyScore)} color="#6366F1" barValue={(place.avgStudyScore / 5) * 100} />}
        {place.avgWifiScore && <MetricCard icon={<Wifi />} label="WiFi" value={wifiLabel(place.avgWifiScore)} color="#22C55E" barValue={(place.avgWifiScore / 5) * 100} />}
      </div>

      {/* Tags */}
      {place.tags && place.tags.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-3">This place is known for</h3>
          <div className="flex flex-wrap gap-2">
            {place.tags.map(tag => (
              <span key={tag} className="badge bg-surface-2 text-text-secondary border border-border text-xs">
                {tag.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent pings */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-live" />
            <h3 className="font-display font-semibold text-text-primary">Live Pings</h3>
            <span className="badge bg-live/10 text-live text-[10px] border border-live/20">LAST 3H</span>
          </div>
          <span className="text-text-muted text-xs">{place._count?.pings || 0} total</span>
        </div>

        {place.recentPings && place.recentPings.length > 0 ? (
          <div className="space-y-3">
            {(place.recentPings as any[]).map((ping: any) => {
              const badge = ping.user?.trustScore?.badge as TrustBadge | undefined;
              return (
                <div key={ping.id} className="bg-surface-2 rounded-xl p-4 border border-border/50">
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {ping.vibeTags.slice(0, 5).map((tag: VibeTag) => (
                      <span key={tag} className="text-xs px-2.5 py-1 bg-surface rounded-full text-text-secondary border border-border">
                        {VIBE_TAG_LABELS[tag] || tag.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                  {ping.note && <p className="text-sm text-text-secondary italic mb-2">"{ping.note}"</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {badge && BADGE_CONFIG[badge]?.icon} {formatDistanceToNow(new Date(ping.createdAt), { addSuffix: true })}
                    </span>
                    {ping.upvotes > 0 && <span className="text-xs text-live">👍 {ping.upvotes} found helpful</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Zap className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-text-secondary text-sm">No pings yet</p>
            <p className="text-text-muted text-xs">Be the first to share the vibe!</p>
          </div>
        )}
      </div>

      {/* Best times placeholder */}
      <div className="card p-5 border-dashed">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-text-primary text-sm">Best Times to Visit</h3>
          <span className="badge bg-surface-2 text-text-muted text-[10px]">Coming Soon</span>
        </div>
        <p className="text-text-muted text-xs">
          Based on historical ping data, we'll show patterns like "Usually quiet on weekday mornings" 
          or "Gets packed after 8pm on Fridays." Drop more pings to help build this data!
        </p>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color, barValue }: any) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-4 h-4" style={{ color }}>{icon}</span>
        <span className="text-[10px] text-text-muted uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-sm font-bold" style={{ color }}>{value}</div>
      <div className="mt-2 h-1 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${barValue}%`, background: color }} />
      </div>
    </div>
  );
}

function noiseLabel(l: number) { return l <= 2 ? 'Quiet' : l <= 3 ? 'Moderate' : l <= 4 ? 'Loud' : 'Very Loud'; }
function noiseColor(l: number) { return l <= 2 ? '#22C55E' : l <= 3 ? '#FCD34D' : l <= 4 ? '#F97316' : '#EF4444'; }
function studyLabel(l: number) { return l >= 4 ? 'Excellent' : l >= 3 ? 'Good' : l >= 2 ? 'Decent' : 'Not great'; }
function wifiLabel(l: number) { return l >= 4 ? 'Excellent' : l >= 3 ? 'Good' : l >= 2 ? 'Spotty' : 'None'; }
