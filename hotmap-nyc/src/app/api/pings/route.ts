// src/app/api/pings/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, unauthorized } from '@/lib/api';
import { canUserPing, recordPingSubmit, updatePlaceVibeAggregates } from '@/lib/trust';

const createPingSchema = z.object({
  placeId: z.string(),
  vibeTags: z.array(z.string()).min(1, 'Select at least one vibe tag').max(6),
  crowdLevel: z.number().int().min(1).max(5).optional(),
  noiseLevel: z.number().int().min(1).max(5).optional(),
  note: z.string().max(150).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const parsed = createPingSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0].message);

    const { placeId, vibeTags, crowdLevel, noiseLevel, note } = parsed.data;

    // Spam/rate limit check
    const { allowed, reason } = await canUserPing(user.id, placeId);
    if (!allowed) return apiError(reason!, 429);

    // Derive crowd level from tags if not provided
    const derivedCrowd = crowdLevel ??
      (vibeTags.includes('packed') ? 5 :
       vibeTags.includes('moderate') ? 3 :
       vibeTags.includes('empty') ? 1 : undefined);

    const ping = await prisma.ping.create({
      data: {
        placeId,
        userId: user.id,
        vibeTags,
        crowdLevel: derivedCrowd,
        noiseLevel,
        note: note?.trim() || null,
        trustWeight: user.trustScore ? Math.min(2, user.trustScore.score / 50 + 0.5) : 0.5,
        expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
      },
      include: {
        user: { select: { username: true, trustScore: { select: { badge: true } } } },
        place: { select: { name: true } },
      },
    });

    // Update trust score and place aggregates (async, don't await)
    recordPingSubmit(user.id).catch(console.error);
    updatePlaceVibeAggregates(placeId).catch(console.error);

    // Create notifications for users who saved this place
    createSavedPlaceNotifications(placeId, ping.place?.name || 'Unknown place').catch(console.error);

    return apiSuccess({ ping }, 201);
  } catch (error) {
    console.error('Create ping error:', error);
    return apiError('Failed to create ping', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get('placeId');
    const live = searchParams.get('live') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const pings = await prisma.ping.findMany({
      where: {
        ...(placeId ? { placeId } : {}),
        ...(live ? { createdAt: { gte: twoHoursAgo } } : {}),
        isSpam: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: { select: { username: true, trustScore: { select: { badge: true } } } },
        place: { select: { id: true, name: true, neighborhood: true, category: true } },
      },
    });

    return apiSuccess({ pings });
  } catch (error) {
    console.error('Get pings error:', error);
    return apiError('Failed to fetch pings', 500);
  }
}

async function createSavedPlaceNotifications(placeId: string, placeName: string) {
  const savedByUsers = await prisma.savedPlace.findMany({
    where: { placeId },
    select: { userId: true },
  });

  if (savedByUsers.length === 0) return;

  await prisma.notification.createMany({
    data: savedByUsers.map(({ userId }) => ({
      userId,
      type: 'PLACE_NEW_PINGS' as const,
      placeId,
      message: `New activity at ${placeName} right now`,
    })),
    skipDuplicates: true,
  });
}
