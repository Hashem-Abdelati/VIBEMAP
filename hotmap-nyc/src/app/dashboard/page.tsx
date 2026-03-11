'use client';
import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Place } from '@/types';
import { useMapStore } from '@/lib/store';
import { FilterBar } from '@/components/map/FilterBar';
import { PlaceCard } from '@/components/places/PlaceCard';
import { PlacePanel } from '@/components/map/PlacePanel';
import { LiveFeed } from '@/components/pings/LiveFeed';
import { PingModal } from '@/components/pings/PingModal';

const MapView = dynamic(
  () => import('@/components/map/MapView').then(m => ({ default: m.MapView })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-ink flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-wire border-t-pulse rounded-full animate-spin mx-auto mb-3" />
          <p className="text-dim text-xs">Loading map</p>
        </div>
      </div>
    ),
  }
);

export default function DashboardPage() {
  const { selectedPlaceId, setSelectedPlace, filters } = useMapStore();
  const [places, setPlaces]     = useState<Place[]>([]);
  const [filtered, setFiltered] = useState<Place[]>([]);
  const [loading, setLoading]   = useState(true);
  const [query, setQuery]       = useState('');
  const [tab, setTab]           = useState<'places'|'feed'>('places');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams({ limit: '80' });
      if (filters.showTrending) p.set('trending', 'true');
      const r = await fetch(`/api/places?${p}`);
      const d = await r.json();
      if (d.success) { setPlaces(d.data.places); setFiltered(d.data.places); }
    } catch {}
    setLoading(false);
  }, [filters.showTrending]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    let res = places;
    if (filters.categories.length > 0)
      res = res.filter(p => filters.categories.includes(p.category));
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q)
      );
    }
    setFiltered(res);
  }, [places, filters.categories, query]);

  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden relative">

      {/* Sidebar */}
      <div className={`flex-shrink-0 bg-ink border-r border-wire flex flex-col transition-all duration-200 overflow-hidden ${
        sidebarOpen ? 'w-72 xl:w-80' : 'w-0'
      }`}>

        <div className="flex-shrink-0 p-3 border-b border-wire space-y-2">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search places, neighborhoods…"
              className="field pl-8 py-2 text-xs" />
            {query && (
              <button onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-mid">
                <X size={11} />
              </button>
            )}
          </div>

          <FilterBar />

          {/* Tabs */}
          <div className="flex gap-0.5 p-0.5 bg-ink-3 rounded-sm border border-wire">
            <button onClick={() => setTab('places')}
              className={`flex-1 py-1.5 text-xs rounded-sm transition-all ${
                tab === 'places' ? 'bg-ink-2 text-ghost border border-wire' : 'text-dim hover:text-mid'
              }`}>
              Places {filtered.length > 0 && `(${filtered.length})`}
            </button>
            <button onClick={() => setTab('feed')}
              className={`flex-1 py-1.5 text-xs rounded-sm transition-all flex items-center justify-center gap-1.5 ${
                tab === 'feed' ? 'bg-ink-2 text-ghost border border-wire' : 'text-dim hover:text-mid'
              }`}>
              <div className="w-1 h-1 rounded-full bg-live" />
              Live
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-px">
          {tab === 'places' ? (
            loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="panel rounded-sm h-28 animate-pulse" />
              ))
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-mid text-xs">No places match</p>
              </div>
            ) : (
              filtered.map(p => (
                <PlaceCard key={p.id} place={p} onSelect={() => setSelectedPlace(p.id)} />
              ))
            )
          ) : (
            <div className="pt-1">
              <LiveFeed limit={20} />
            </div>
          )}
        </div>
      </div>

      {/* Sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(o => !o)}
        className="absolute top-1/2 -translate-y-1/2 z-30 w-4 h-10 bg-ink-2 border border-wire flex items-center justify-center hover:bg-ink-3 transition-all"
        style={{
          left: sidebarOpen ? (typeof window !== 'undefined' && window.innerWidth >= 1280 ? 320 : 288) : 0,
          borderRadius: '0 3px 3px 0',
        }}
      >
        {sidebarOpen
          ? <ChevronLeft size={10} className="text-dim" />
          : <ChevronRight size={10} className="text-dim" />}
      </button>

      {/* Map */}
      <div className="flex-1 min-w-0 relative">
        <MapView
          places={filtered}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={setSelectedPlace}
        />

        {/* Place panel */}
        {selectedPlaceId && (
          <div className="absolute right-0 top-0 bottom-0 w-72 xl:w-80 bg-ink border-l border-wire shadow-2xl overflow-hidden z-20">
            <PlacePanel placeId={selectedPlaceId} onClose={() => setSelectedPlace(null)} />
          </div>
        )}
      </div>

      <PingModal />
    </div>
  );
}