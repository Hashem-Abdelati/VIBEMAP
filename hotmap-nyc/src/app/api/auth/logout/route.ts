// src/app/api/auth/logout/route.ts
import { clearAuthCookie } from '@/lib/auth';
import { apiSuccess } from '@/lib/api';

export async function POST() {
  clearAuthCookie();
  return apiSuccess({ message: 'Logged out' });
}
