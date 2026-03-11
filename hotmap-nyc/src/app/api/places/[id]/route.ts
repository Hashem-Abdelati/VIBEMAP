// src/app/api/places/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const place = await prisma.place.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { pings: true } },
        pings: {
          where: { createdAt: { gte: twoHoursAgo }, isSpam: false },
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { username: true, trustScore: { select: { badge: true, score: true } } } },
            votes: user ? { where: { userId: user.id } } : false,
          },
        },
        savedBy: user ? { where: { userId: user.id } } : false,
      },
    });

    if (!place) return apiError('Place not found', 404);

    return apiSuccess({
      place: {
        ...place,
        isSaved: user ? place.savedBy && place.savedBy.length > 0 : false,
        savedBy: undefined,
        pings: place.pings.map(p => ({
          ...p,
          userVote: user ? (p.votes && p.votes.length > 0 ? p.votes[0].isHelpful : null) : null,
          votes: undefined,
        })),
      },
    });
  } catch (error) {
    console.error('Place detail error:', error);
    return apiError('Failed to fetch place', 500);
  }
}
