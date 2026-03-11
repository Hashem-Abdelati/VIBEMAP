// src/app/api/places/[id]/save/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, unauthorized } from '@/lib/api';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const existing = await prisma.savedPlace.findUnique({
      where: { userId_placeId: { userId: user.id, placeId: params.id } },
    });

    if (existing) {
      await prisma.savedPlace.delete({ where: { id: existing.id } });
      return apiSuccess({ saved: false });
    } else {
      await prisma.savedPlace.create({ data: { userId: user.id, placeId: params.id } });
      return apiSuccess({ saved: true });
    }
  } catch {
    return apiError('Failed to save place', 500);
  }
}
