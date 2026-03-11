'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const d = await r.json();
      if (d.success) { setUser(d.data.user); router.push('/dashboard'); }
      else setError(d.error || 'Invalid credentials');
    } catch { setError('Connection error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-light text-ghost mb-1">Welcome back</h1>
        <p className="text-dim text-sm">Sign in to check what's happening</p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label-caps block mb-1.5">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" required className="field" />
        </div>
        <div>
          <label className="label-caps block mb-1.5">Password</label>
          <div className="relative">
            <input type={show ? 'text' : 'password'} value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••" required className="field pr-10" />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-mid">
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-xs py-2">{error}</p>}

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 mt-1">
          {loading
            ? <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
            : 'Sign in'
          }
        </button>
      </form>

      {/* Demo shortcut */}
      <button
        onClick={() => { setEmail('demo@hotmapnyc.com'); setPass('password123'); }}
        className="w-full mt-3 py-2 border border-dashed border-wire text-dim text-xs rounded-sm hover:border-wire-2 hover:text-mid transition-all">
        Use demo account
      </button>

      <p className="text-dim text-xs mt-6 text-center">
        No account?{' '}
        <Link href="/auth/signup" className="text-pulse hover:text-pulse-bright transition-colors">
          Create one
        </Link>
      </p>
    </div>
  );
}