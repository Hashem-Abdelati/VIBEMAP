// src/app/api/notifications/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { apiSuccess, apiError, unauthorized } from '@/lib/api';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: { place: { select: { id: true, name: true, category: true } } },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return apiSuccess({ notifications, unreadCount });
  } catch {
    return apiError('Failed to fetch notifications', 500);
  }
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { ids } = await req.json();
    await prisma.notification.updateMany({
      where: { userId: user.id, ...(ids ? { id: { in: ids } } : {}) },
      data: { isRead: true },
    });
    return apiSuccess({ updated: true });
  } catch {
    return apiError('Failed to update notifications', 500);
  }
}
