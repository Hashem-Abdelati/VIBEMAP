// src/lib/api.ts
import { NextResponse } from 'next/server';

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorized() {
  return apiError('Unauthorized', 401);
}

// Client-side fetch helpers
export async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  
  return res.json();
}

export const api = {
  get: <T>(url: string) => fetchJSON<T>(url),
  post: <T>(url: string, body: unknown) =>
    fetchJSON<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown) =>
    fetchJSON<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string) => fetchJSON<T>(url, { method: 'DELETE' }),
};

// cn utility
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
