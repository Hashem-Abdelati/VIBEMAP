'use client';
// src/components/auth/AuthProvider.tsx
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.success) setUser(data.data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setUser, setLoading]);

  return <>{children}</>;
}
