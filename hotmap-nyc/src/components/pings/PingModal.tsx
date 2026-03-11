'use client';
import { useState, useEffect } from 'react';
import { X, Zap, Check } from 'lucide-react';
import { useMapStore } from '@/lib/store';
import { Place, VibeTag } from '@/types';

const VIBE_GROUPS: { label: string; tags: { id: VibeTag; label: string }[] }[] = [
  {
    label: 'Crowd',
    tags: [
      { id: 'empty',    label: 'Empty'    },
      { id: 'moderate', label: 'Moderate' },
      { id: 'packed',   label: 'Packed'   },
    ],
  },
  {
    label: 'Atmosphere',
    tags: [
      { id: 'quiet',        label: 'Quiet'       },
      { id: 'loud',         label: 'Loud'        },
      { id: 'social',       label: 'Social'      },
      { id: 'good_music',   label: 'Good music'  },
    ],
  },
  {
    label: 'For work',
    tags: [
      { id: 'good_for_studying',    label: 'Study-friendly'  },
      { id: 'good_for_remote_work', label: 'Remote-friendly' },
      { id: 'wifi_good',            label: 'WiFi solid'      },
    ],
  },
  {
    label: 'Practical',
    tags: [
      { id: 'easy_seating', label: 'Easy seating' },
      { id: 'long_line',    label: 'Long line'    },
      { id: 'not_worth_it', label: 'Skip it'      },
    ],
  },
];

export function PingModal() {
  const { showPingModal, pingTargetPlaceId, closePingModal } = useMapStore();
  const [place, setPlace]           = useState<Place | null>(null);
  const [tags, setTags]             = useState<VibeTag[]>([]);
  const [note, setNote]             = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!pingTargetPlaceId || !showPingModal) return;
    setTags([]); setNote(''); setSuccess(false); setError('');
    fetch(`/api/places/${pingTargetPlaceId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setPlace(d.data.place); });
  }, [pingTargetPlaceId, showPingModal]);

  const toggle = (tag: VibeTag) =>
    setTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);

  const submit = async () => {
    if (!tags.length) { setError('Select at least one tag'); return; }
    setSubmitting(true); setError('');
    try {
      const r = await fetch('/api/pings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId: pingTargetPlaceId, vibeTags: tags, note: note.trim() || undefined }),
      });
      const d = await r.json();
      if (!d.success) { setError(d.error || 'Failed'); }
      else { setSuccess(true); setTimeout(closePingModal, 1800); }
    } catch { setError('Connection error'); }
    finally { setSubmitting(false); }
  };

  if (!showPingModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={closePingModal} />

      <div className="relative w-full max-w-md panel rounded-sm shadow-2xl animate-slide-up overflow-hidden">

        {success ? (
          <div className="py-16 text-center">
            <div className="w-10 h-10 rounded-sm bg-live/10 border border-live/20 flex items-center justify-center mx-auto mb-4">
              <Check size={18} className="text-live" />
            </div>
            <div className="font-display text-2xl text-ghost mb-1">Ping sent</div>
            <p className="text-dim text-sm">Thanks for keeping NYC informed.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-wire">
              <div>
                <div className="text-ghost font-medium text-sm">Drop a ping</div>
                {place && <div className="text-dim text-xs mt-0.5">{place.name}</div>}
              </div>
              <button onClick={closePingModal} className="p-1.5 hover:bg-ink-3 rounded-sm transition-all">
                <X size={15} className="text-dim" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Tag groups */}
              {VIBE_GROUPS.map(group => (
                <div key={group.label}>
                  <div className="label-caps mb-2">{group.label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.tags.map(({ id, label }) => {
                      const on = tags.includes(id);
                      return (
                        <button key={id} onClick={() => toggle(id)}
                          className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-all ${
                            on
                              ? 'bg-pulse/10 text-pulse border-pulse/40'
                              : 'bg-transparent text-mid border-wire hover:border-wire-2 hover:text-pale'
                          }`}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Note */}
              <div>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value.slice(0, 150))}
                  placeholder="Optional note (150 chars)"
                  rows={2}
                  className="field resize-none text-xs"
                />
                <div className="text-right mono text-dim mt-1">{note.length}/150</div>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button onClick={submit} disabled={submitting || !tags.length}
                className="btn btn-primary w-full py-2.5 gap-2">
                {submitting
                  ? <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
                  : <><Zap size={13} /> Send ping</>
                }
              </button>

              <p className="text-center text-dim text-xs">Anonymous · Expires in 3 hours</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}