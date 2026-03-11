'use client';
// src/app/profile/page.tsx
import { useState } from 'react';
import Link from 'next/link';
import { Zap, Award, TrendingUp, LogOut } from 'lucide-react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/lib/store';
import { BADGE_CONFIG, TrustBadge } from '@/types';

export default function ProfilePage() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="pt-14">
        <ProfileContent />
      </div>
    </AuthProvider>
  );
}

function ProfileContent() {
  const { user, logout } = useAuthStore();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h2 className="font-display font-bold text-xl text-text-primary mb-4">Sign in to view your profile</h2>
        <Link href="/auth/login" className="btn-primary inline-flex">Sign in</Link>
      </div>
    );
  }

  const badge = user.trustScore?.badge as TrustBadge | undefined;
  const badgeConfig = badge ? BADGE_CONFIG[badge] : null;
  const trustPct = Math.min(100, (user.trustScore?.score || 0));

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-live flex items-center justify-center text-2xl font-bold text-background">
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-text-primary">@{user.username}</h1>
            <p className="text-text-muted text-sm">{user.email}</p>
            {user.profile?.borough && (
              <p className="text-text-secondary text-sm mt-1">
                📍 {user.profile.borough.replace('_', ' ')}
                {user.profile.neighborhood && ` · ${user.profile.neighborhood}`}
              </p>
            )}
          </div>
        </div>

        {/* Trust score */}
        {user.trustScore && (
          <div className="bg-surface-2 rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {badgeConfig && (
                  <span className="text-lg">{badgeConfig.icon}</span>
                )}
                <div>
                  <div className="text-sm font-semibold" style={{ color: badgeConfig?.color || '#6B7280' }}>
                    {badgeConfig?.label}
                  </div>
                  <div className="text-xs text-text-muted">Trust Score: {Math.round(trustPct)}/100</div>
                </div>
              </div>
              <Award className="w-5 h-5 text-accent" />
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${trustPct}%`, background: `linear-gradient(90deg, ${badgeConfig?.color}, hsl(28,100%,55%))` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="text-center">
                <div className="font-display font-bold text-2xl text-text-primary">{user.trustScore.totalPings}</div>
                <div className="text-xs text-text-muted">Pings dropped</div>
              </div>
              <div className="text-center">
                <div className="font-display font-bold text-2xl text-text-primary">{user.trustScore.upvotesReceived}</div>
                <div className="text-xs text-text-muted">Upvotes received</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interests */}
      {user.profile?.interests && user.profile.interests.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-3">Your interests</h3>
          <div className="flex flex-wrap gap-2">
            {user.profile.interests.map((interest: string) => (
              <span key={interest} className="badge bg-accent/10 text-accent border border-accent/20 text-xs">
                {interest.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* How to level up */}
      <div className="card p-5 mb-6">
        <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" /> Level up your trust score
        </h3>
        <div className="space-y-3">
          {[
            { action: 'Drop accurate pings', reward: '+0.5 per ping' },
            { action: 'Get upvotes on your pings', reward: '+1 per upvote' },
            { action: 'Stay consistent', reward: 'Multiplier bonus' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-accent" /> {item.action}
              </span>
              <span className="text-live text-xs font-mono">{item.reward}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-col gap-3">
        <Link href="/dashboard" className="btn-primary flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" /> Drop a Ping
        </Link>
        <button onClick={logout} className="btn-secondary flex items-center justify-center gap-2 text-red-400 hover:text-red-300">
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
