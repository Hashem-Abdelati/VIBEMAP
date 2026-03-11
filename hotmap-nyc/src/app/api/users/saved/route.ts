// src/app/api/users/saved/route.ts
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, unauthorized } from '@/lib/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const saved = await prisma.savedPlace.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        place: {
          include: {
            _count: { select: { pings: true } },
            pings: {
              where: { createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) }, isSpam: false },
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    return apiSuccess({ saved });
  } catch {
    return apiError('Failed to fetch saved places', 500);
  }
}
