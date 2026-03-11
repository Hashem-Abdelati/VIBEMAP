'use client';
// src/app/notifications/page.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, TrendingUp, Zap, MapPin, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { useAuthStore } from '@/lib/store';
import { Notification } from '@/types';

export default function NotificationsPage() {
  return (
    <AuthProvider>
      <Navbar />
      <div className="pt-14">
        <NotificationsContent />
      </div>
    </AuthProvider>
  );
}

function NotificationsContent() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => { if (d.success) setNotifications(d.data.notifications); })
      .finally(() => setLoading(false));
  }, [user]);

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Bell className="w-12 h-12 text-text-muted mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl text-text-primary mb-2">Sign in to see notifications</h2>
        <Link href="/auth/login" className="btn-primary inline-flex">Sign in</Link>
      </div>
    );
  }

  const unread = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    if (type === 'PLACE_TRENDING') return <TrendingUp className="w-4 h-4 text-accent" />;
    if (type === 'PLACE_NEW_PINGS') return <Zap className="w-4 h-4 text-live" />;
    return <MapPin className="w-4 h-4 text-text-secondary" />;
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary mb-1">Notifications</h1>
          {unread > 0 && <p className="text-accent text-sm">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-2">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-16 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="font-display font-bold text-xl text-text-primary mb-2">All quiet</h3>
          <p className="text-text-secondary text-sm">Save places to get notified when they're trending.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`card p-4 transition-all ${!n.isRead ? 'border-accent/20 bg-accent/3' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-accent/10' : 'bg-surface-2'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${!n.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {n.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-text-muted">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                    {n.placeId && (
                      <Link href={`/place/${n.placeId}`} className="text-[10px] text-accent hover:underline">
                        View place →
                      </Link>
                    )}
                  </div>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
