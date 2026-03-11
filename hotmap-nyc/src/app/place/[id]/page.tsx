// src/app/place/[id]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PlaceDetailClient } from './PlaceDetailClient';

export default async function PlacePage({ params }: { params: { id: string } }) {
  const place = await prisma.place.findUnique({
    where: { id: params.id },
    include: {
      _count: { select: { pings: true } },
      pings: {
        where: {
          createdAt: { gte: new Date(Date.now() - 3 * 60 * 60 * 1000) },
          isSpam: false,
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true, trustScore: { select: { badge: true, score: true } } } },
        },
      },
    },
  });

  if (!place) notFound();

  return <PlaceDetailClient place={JSON.parse(JSON.stringify(place))} />;
}
