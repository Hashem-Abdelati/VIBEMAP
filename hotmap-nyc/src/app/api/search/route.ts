// src/app/api/search/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api';
import { Category } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') as Category | null;
    const vibe = searchParams.get('vibe');
    const goodFor = searchParams.get('goodFor'); // studying, socializing, working, nightlife

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // Build vibe tag filter based on goodFor
    let vibeTagFilter: string[] = [];
    if (goodFor === 'studying') vibeTagFilter = ['good_for_studying', 'quiet'];
    else if (goodFor === 'working') vibeTagFilter = ['good_for_remote_work', 'wifi_good'];
    else if (goodFor === 'socializing') vibeTagFilter = ['social', 'good_music'];
    else if (goodFor === 'nightlife') vibeTagFilter = ['social', 'packed'];

    const places = await prisma.place.findMany({
      where: {
        ...(q ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { neighborhood: { contains: q, mode: 'insensitive' } },
            { address: { contains: q, mode: 'insensitive' } },
          ],
        } : {}),
        ...(category ? { category } : {}),
        ...(vibeTagFilter.length > 0 ? {
          pings: {
            some: {
              createdAt: { gte: twoHoursAgo },
              vibeTags: { hasSome: vibeTagFilter },
              isSpam: false,
            },
          },
        } : {}),
      },
      take: 20,
      orderBy: { vibeScore: 'desc' },
      include: {
        _count: { select: { pings: true } },
        pings: {
          where: { createdAt: { gte: twoHoursAgo }, isSpam: false },
          take: 2,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return apiSuccess({ places, query: q, total: places.length });
  } catch (error) {
    console.error('Search error:', error);
    return apiError('Search failed', 500);
  }
}
