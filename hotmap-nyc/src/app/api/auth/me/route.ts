// src/app/api/auth/me/route.ts
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, unauthorized } from '@/lib/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  return apiSuccess({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      profile: user.profile,
      trustScore: user.trustScore,
    },
  });
}
