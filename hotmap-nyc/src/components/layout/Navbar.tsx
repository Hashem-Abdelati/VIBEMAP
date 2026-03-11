'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Map, Bookmark, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

const NAV = [
  { href: '/dashboard',      icon: Map,      label: 'Map'    },
  { href: '/saved',          icon: Bookmark, label: 'Saved'  },
  { href: '/notifications',  icon: Bell,     label: 'Alerts' },
];

const BADGE_LABEL: Record<string, string> = {
  NEW_CONTRIBUTOR: 'New',
  TRUSTED_LOCAL:   'Trusted',
  TOP_SPOTTER:     'Top Spotter',
};

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-12 border-b border-wire flex items-center"
      style={{ background: 'rgba(12,12,12,0.92)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-screen-2xl mx-auto px-4 flex items-center justify-between h-full">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="live-indicator" />
          <span className="font-display text-base font-light tracking-wide text-ghost group-hover:text-snow transition-colors">
            Hot Map
          </span>
          <span className="label-caps text-dim">NYC</span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all ${
                  active
                    ? 'bg-ink-3 text-ghost border border-wire'
                    : 'text-dim hover:text-pale hover:bg-ink-2'
                }`}>
                <Icon size={12} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-sm hover:bg-ink-3 border border-transparent hover:border-wire transition-all"
              >
                <div className="w-5 h-5 rounded-sm bg-pulse flex items-center justify-center text-ink text-xs font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-xs text-pale hidden sm:block">{user.username}</span>
                {user.trustScore && (
                  <span className="label-caps text-dim hidden sm:block">
                    {BADGE_LABEL[user.trustScore.badge] || ''}
                  </span>
                )}
                <ChevronDown size={11} className="text-dim" />
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-1 w-44 panel rounded-sm shadow-2xl py-1 z-50">
                  <Link href="/profile" onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-mid hover:text-ghost hover:bg-ink-3 transition-all">
                    <User size={12} /> Profile
                  </Link>
                  <Link href="/saved" onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-mid hover:text-ghost hover:bg-ink-3 transition-all">
                    <Bookmark size={12} /> Saved Places
                  </Link>
                  <div className="rule my-1" />
                  <button onClick={() => { logout(); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-mid hover:text-red-400 hover:bg-ink-3 transition-all">
                    <LogOut size={12} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login"  className="btn btn-ghost text-xs py-1.5 px-3">Sign in</Link>
              <Link href="/auth/signup" className="btn btn-primary text-xs py-1.5 px-4">Get access</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 border-t border-wire flex"
        style={{ background: 'rgba(12,12,12,0.95)', backdropFilter: 'blur(12px)' }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-2xs transition-all ${
                active ? 'text-pulse' : 'text-dim'
              }`}>
              <Icon size={16} strokeWidth={active ? 2 : 1.5} />
              <span className="label-caps" style={{ fontSize: '0.55rem' }}>{label}</span>
            </Link>
          );
        })}
        <Link href={user ? '/profile' : '/auth/login'}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-2xs transition-all ${
            pathname === '/profile' ? 'text-pulse' : 'text-dim'
          }`}>
          <User size={16} strokeWidth={pathname === '/profile' ? 2 : 1.5} />
          <span className="label-caps" style={{ fontSize: '0.55rem' }}>{user ? 'Profile' : 'Sign in'}</span>
        </Link>
      </div>
    </nav>
  );
}