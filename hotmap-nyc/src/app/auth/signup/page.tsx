'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const BOROUGHS = ['MANHATTAN','BROOKLYN','QUEENS','BRONX','STATEN_ISLAND'];
const BOROUGH_LABEL: Record<string,string> = {
  MANHATTAN: 'Manhattan', BROOKLYN: 'Brooklyn', QUEENS: 'Queens',
  BRONX: 'The Bronx', STATEN_ISLAND: 'Staten Island',
};
const INTERESTS = ['coffee','studying','remote_work','gyms','nightlife','food','parks'];

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [step, setStep]       = useState(1);
  const [email, setEmail]     = useState('');
  const [username, setUsername] = useState('');
  const [pass, setPass]       = useState('');
  const [show, setShow]       = useState(false);
  const [borough, setBorough] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const toggleInterest = (id: string) =>
    setInterests(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password: pass, borough: borough || undefined, interests }),
      });
      const d = await r.json();
      if (d.success) { setUser(d.data.user); router.push('/dashboard'); }
      else { setError(d.error || 'Sign up failed'); setStep(1); }
    } catch { setError('Connection error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {[1,2].map(s => (
          <div key={s} className="h-px flex-1 transition-all"
            style={{ background: s <= step ? '#C8923A' : '#2E2E2E' }} />
        ))}
      </div>

      <form onSubmit={submit}>
        {step === 1 ? (
          <>
            <div className="mb-8">
              <h1 className="font-display text-4xl font-light text-ghost mb-1">Create account</h1>
              <p className="text-dim text-sm">Join the NYC vibe network</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label-caps block mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required className="field" />
              </div>
              <div>
                <label className="label-caps block mb-1.5">Username</label>
                <input type="text" value={username}
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,''))}
                  placeholder="your_handle" required minLength={3} maxLength={20}
                  className="field font-mono" />
              </div>
              <div>
                <label className="label-caps block mb-1.5">Password</label>
                <div className="relative">
                  <input type={show ? 'text' : 'password'} value={pass}
                    onChange={e => setPass(e.target.value)}
                    placeholder="8+ characters" required minLength={8}
                    className="field pr-10" />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-mid">
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="font-display text-4xl font-light text-ghost mb-1">Your NYC</h1>
              <p className="text-dim text-sm">Optional — personalizes your feed</p>
            </div>
            <div className="space-y-5">
              <div>
                <div className="label-caps mb-2">Borough</div>
                <div className="flex flex-wrap gap-1.5">
                  {BOROUGHS.map(b => (
                    <button key={b} type="button"
                      onClick={() => setBorough(borough === b ? '' : b)}
                      className={`px-3 py-1.5 rounded-sm text-xs border transition-all ${
                        borough === b
                          ? 'bg-pulse/10 text-pulse border-pulse/40'
                          : 'bg-transparent text-mid border-wire hover:border-wire-2'
                      }`}>
                      {BOROUGH_LABEL[b]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="label-caps mb-2">I go to NYC for</div>
                <div className="flex flex-wrap gap-1.5">
                  {INTERESTS.map(id => (
                    <button key={id} type="button" onClick={() => toggleInterest(id)}
                      className={`px-3 py-1.5 rounded-sm text-xs border transition-all ${
                        interests.includes(id)
                          ? 'bg-pulse/10 text-pulse border-pulse/40'
                          : 'bg-transparent text-mid border-wire hover:border-wire-2'
                      }`}>
                      {id.replace('_',' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 mt-6">
          {loading
            ? <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
            : step === 1 ? 'Continue' : 'Create account'
          }
        </button>

        {step === 2 && (
          <button type="button" onClick={() => setStep(1)}
            className="w-full mt-2 py-2 text-dim text-xs hover:text-mid transition-colors">
            Back
          </button>
        )}
      </form>

      <p className="text-dim text-xs mt-6 text-center">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-pulse hover:text-pulse-bright transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}