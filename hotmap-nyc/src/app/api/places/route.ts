// src/app/api/places/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api';
import { Category, Borough } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as Category | null;
    const borough = searchParams.get('borough') as Borough | null;
    const trending = searchParams.get('trending') === 'true';
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const q = searchParams.get('q');

    const user = await getCurrentUser();

    const where: any = {};
    if (category) where.category = category;
    if (borough) where.borough = borough;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { neighborhood: { contains: q, mode: 'insensitive' } },
        { tags: { hasSome: [q.toLowerCase()] } },
      ];
    }

    const places = await prisma.place.findMany({
      where,
      take: limit,
      orderBy: trending ? { trendVelocity: 'desc' } : { vibeScore: 'desc' },
      include: {
        _count: { select: { pings: true } },
        pings: {
          where: { createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) }, isSpam: false },
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { username: true, trustScore: { select: { badge: true } } } } },
        },
        savedBy: user ? { where: { userId: user.id } } : false,
      },
    });

    const placesWithSaved = places.map(p => ({
      ...p,
      isSaved: user ? p.savedBy && p.savedBy.length > 0 : false,
      savedBy: undefined, // don't leak to client
    }));

    return apiSuccess({ places: placesWithSaved });
  } catch (error) {
    console.error('Places GET error:', error);
    return apiError('Failed to fetch places', 500);
  }
}
