import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';

const LIVE_EXAMPLES = [
  { place: 'Think Coffee', neighborhood: 'West Village', status: 'Quiet · 2 seats left', time: '3m' },
  { place: 'Dead Rabbit',  neighborhood: 'FiDi',         status: 'Packed · Long line',   time: '1m' },
  { place: 'NYPL Main',   neighborhood: 'Midtown',       status: 'Empty · Great focus',  time: '6m' },
  { place: 'Domino Park',  neighborhood: 'Williamsburg', status: 'Lively · Nice weather', time: '4m' },
  { place: 'Equinox',      neighborhood: 'Bryant Park',  status: 'Moderate traffic',     time: '8m' },
];

const CATEGORIES = [
  { label: 'Coffee',   count: '12 active' },
  { label: 'Study',    count: '8 active'  },
  { label: 'Bars',     count: '19 active' },
  { label: 'Gyms',     count: '6 active'  },
  { label: 'Parks',    count: '9 active'  },
  { label: 'Food',     count: '23 active' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink text-ghost">

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 h-12 border-b border-wire flex items-center px-6"
        style={{ background: 'rgba(12,12,12,0.9)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center justify-between w-full max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="live-indicator" />
            <span className="font-display text-lg font-light tracking-wide text-ghost">Hot Map</span>
            <span className="label-caps text-dim">NYC</span>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/auth/login"  className="btn btn-ghost text-xs">Sign in</Link>
            <Link href="/auth/signup" className="btn btn-primary text-xs px-4 py-2">Get access</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-12 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col justify-center px-6 max-w-screen-xl mx-auto w-full py-24">

          {/* Headline — editorial serif, massive */}
          <h1 className="heading-xl text-[clamp(4rem,12vw,9rem)] text-ghost mb-8 max-w-4xl">
            Know the vibe<br />
            <span style={{ color: '#C8923A', fontStyle: 'italic' }}>before you go.</span>
          </h1>

          <p className="text-mid text-base max-w-lg mb-12 leading-relaxed" style={{ fontFamily: 'var(--font-instrument)' }}>
            Community-powered signals from the people already there.
            Coffee shops, bars, gyms, study spots — in real time.
          </p>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn btn-primary gap-2 py-3 px-6 text-sm">
              Open the map <ArrowRight size={14} />
            </Link>
            <Link href="/auth/signup" className="btn btn-secondary py-3 px-6 text-sm">
              Create account
            </Link>
          </div>
        </div>

        {/* Live ticker strip */}
        {/* <div className="border-t border-wire" style={{ background: '#0C0C0C' }}>
          <div className="max-w-screen-xl mx-auto px-6 py-5">
            <div className="flex items-center gap-6 overflow-x-auto pb-1">
              <span className="label-caps flex-shrink-0">Live now</span>
              <div className="w-px h-4 bg-wire flex-shrink-0" />
              {LIVE_EXAMPLES.map((ex, i) => (
                <div key={i} className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-ghost text-xs font-medium">{ex.place}</div>
                    <div className="text-dim text-2xs">{ex.neighborhood}</div>
                  </div>
                  <div className="w-px h-6 bg-wire" />
                  <div>
                    <div className="text-pale text-xs">{ex.status}</div>
                    <div className="mono text-dim">{ex.time} ago</div>
                  </div>
                  {i < LIVE_EXAMPLES.length - 1 && <div className="w-px h-6 bg-wire ml-3" />}
                </div>
              ))}
            </div>
          </div>
        </div> */}
      </section>

      {/* How it works */}
      <section className="py-32 px-6 border-t border-wire">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="label-caps mb-6">How it works</div>
              <h2 className="heading-xl text-5xl text-ghost mb-8">
                Real people.<br/>Real signals.<br/>
                <span style={{ fontStyle: 'italic', color: '#C8923A' }}>Right now.</span>
              </h2>
              <p className="text-mid leading-relaxed mb-8 max-w-sm">
                Drop a ping in under ten seconds. Tell others if it's packed, quiet,
                good for working, or not worth the trip. Pings expire in three hours —
                keeping the information honest.
              </p>
              <Link href="/dashboard" className="btn btn-secondary gap-2">
                Explore the map <ArrowRight size={13} />
              </Link>
            </div>

            {/* Steps */}
            <div className="space-y-0">
              {[
                { n: '01', title: 'Check the map',   desc: 'See live crowd and vibe data across every NYC neighborhood before you leave.' },
                { n: '02', title: 'Read fresh pings', desc: 'Short, specific, and time-stamped. Each ping expires after 3 hours.' },
                { n: '03', title: 'Contribute',       desc: 'Drop a ping when you\'re somewhere. Earn trust as others find your reads useful.' },
              ].map((step, i) => (
                <div key={i} className="flex gap-6 py-8 border-b border-wire last:border-b-0">
                  <div className="mono text-dim pt-0.5 w-8 flex-shrink-0">{step.n}</div>
                  <div>
                    <div className="text-ghost font-medium mb-1">{step.title}</div>
                    <div className="text-dim text-sm leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="py-24 px-6 border-t border-wire">
        <div className="max-w-screen-xl mx-auto">
          <div className="label-caps mb-10">Coverage</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-wire">
            {CATEGORIES.map((cat, i) => (
              <div key={i} className="bg-ink p-6 hover:bg-ink-2 transition-colors group">
                <div className="text-ghost font-medium text-sm mb-1 group-hover:text-pulse transition-colors">{cat.label}</div>
                <div className="mono text-dim">{cat.count}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-24 px-6 border-t border-wire">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <div className="label-caps mb-6">Trust system</div>
              <h2 className="heading-xl text-4xl text-ghost mb-6">
                Signal over noise.
              </h2>
              <p className="text-mid leading-relaxed max-w-sm">
                Pings are weighted by contributor credibility. Frequent, accurate reporters
                carry more signal. Spam and contradictory patterns reduce trust automatically.
              </p>
            </div>
            <div className="space-y-px">
              {[
                { badge: 'New Contributor', desc: 'Getting started',             metric: '0–29' },
                { badge: 'Trusted Local',   desc: 'Consistent track record',     metric: '30–74' },
                { badge: 'Top Spotter',     desc: 'High-signal, high-frequency', metric: '75+' },
              ].map((b, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-ink-2 border border-wire rounded-sm">
                  <div>
                    <div className="text-ghost text-sm font-medium">{b.badge}</div>
                    <div className="text-dim text-xs mt-0.5">{b.desc}</div>
                  </div>
                  <div className="mono text-pulse">{b.metric}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 border-t border-wire">
        <div className="max-w-screen-xl mx-auto text-center">
          <h2 className="heading-xl text-[clamp(3rem,8vw,6rem)] text-ghost mb-8">
            The city is<br/>
            <span style={{ fontStyle: 'italic', color: '#C8923A' }}>live right now.</span>
          </h2>
          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard" className="btn btn-primary py-3 px-8 gap-2">
              <MapPin size={14} /> Open Map
            </Link>
            <Link href="/auth/signup" className="btn btn-secondary py-3 px-8">
              Create account
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-wire py-6 px-6">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="live-indicator" />
            <span className="font-display text-base font-light text-mid">Hot Map NYC</span>
          </div>
          <span className="label-caps">Community-powered · Real-time</span>
        </div>
      </footer>
    </div>
  );
}