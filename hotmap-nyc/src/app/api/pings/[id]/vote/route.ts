// src/app/api/pings/[id]/vote/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, unauthorized } from '@/lib/api';
import { recordUpvoteReceived } from '@/lib/trust';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { helpful } = await req.json();

    const existing = await prisma.pingVote.findUnique({
      where: { pingId_userId: { pingId: params.id, userId: user.id } },
    });

    if (existing) {
      if (existing.isHelpful === helpful) {
        // Remove vote
        await prisma.pingVote.delete({ where: { id: existing.id } });
        await prisma.ping.update({
          where: { id: params.id },
          data: { upvotes: { decrement: helpful ? 1 : 0 } },
        });
        return apiSuccess({ voted: false });
      } else {
        // Change vote
        await prisma.pingVote.update({ where: { id: existing.id }, data: { isHelpful: helpful } });
        return apiSuccess({ voted: true, helpful });
      }
    }

    await prisma.pingVote.create({
      data: { pingId: params.id, userId: user.id, isHelpful: helpful },
    });

    if (helpful) {
      await prisma.ping.update({ where: { id: params.id }, data: { upvotes: { increment: 1 } } });
      await recordUpvoteReceived(params.id);
    }

    return apiSuccess({ voted: true, helpful });
  } catch {
    return apiError('Failed to vote', 500);
  }
}
