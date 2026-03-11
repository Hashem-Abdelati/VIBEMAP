// src/lib/trust.ts
import { prisma } from './prisma';
import { TrustBadge } from '@prisma/client';

export function calculateBadge(score: number): TrustBadge {
  if (score >= 75) return TrustBadge.TOP_SPOTTER;
  if (score >= 30) return TrustBadge.TRUSTED_LOCAL;
  return TrustBadge.NEW_CONTRIBUTOR;
}

export async function updateTrustScore(userId: string, delta: number) {
  const trust = await prisma.trustScore.findUnique({ where: { userId } });
  if (!trust) return;

  const newScore = Math.max(0, Math.min(100, trust.score + delta));
  const newBadge = calculateBadge(newScore);

  await prisma.trustScore.update({
    where: { userId },
    data: { score: newScore, badge: newBadge },
  });
}

export async function recordPingSubmit(userId: string) {
  await prisma.trustScore.update({
    where: { userId },
    data: {
      totalPings: { increment: 1 },
      lastPingAt: new Date(),
      score: { increment: 0.5 }, // small boost per ping
    },
  });

  // Recalculate badge
  const trust = await prisma.trustScore.findUnique({ where: { userId } });
  if (trust) {
    await prisma.trustScore.update({
      where: { userId },
      data: { badge: calculateBadge(trust.score) },
    });
  }
}

export async function recordUpvoteReceived(pingId: string) {
  const ping = await prisma.ping.findUnique({ where: { id: pingId } });
  if (!ping) return;

  await prisma.trustScore.upsert({
    where: { userId: ping.userId },
    update: {
      upvotesReceived: { increment: 1 },
      score: { increment: 1 }, // upvote = bigger trust boost
    },
    create: {
      userId: ping.userId,
      upvotesReceived: 1,
      score: 1,
      badge: TrustBadge.NEW_CONTRIBUTOR,
    },
  });
}

// Check if user can submit a ping (anti-spam)
export async function canUserPing(userId: string, placeId: string): Promise<{ allowed: boolean; reason?: string }> {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);

  // Can't ping same place within 5 minutes
  const recentSamePlacePing = await prisma.ping.findFirst({
    where: { userId, placeId, createdAt: { gte: fiveMinAgo } },
  });
  if (recentSamePlacePing) {
    return { allowed: false, reason: 'You already pinged this place in the last 5 minutes' };
  }

  // Can't submit more than 10 pings in 30 minutes
  const recentPingCount = await prisma.ping.count({
    where: { userId, createdAt: { gte: thirtyMinAgo } },
  });
  if (recentPingCount >= 10) {
    return { allowed: false, reason: 'Too many pings! Take a break and explore the city 🗺️' };
  }

  return { allowed: true };
}

// Update place vibe aggregates after a new ping
export async function updatePlaceVibeAggregates(placeId: string) {
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

  const recentPings = await prisma.ping.findMany({
    where: { placeId, createdAt: { gte: threeHoursAgo }, isSpam: false },
  });

  if (recentPings.length === 0) return;

  const avgCrowd = recentPings.reduce((s, p) => s + (p.crowdLevel ?? 3), 0) / recentPings.length;
  const avgNoise = recentPings.reduce((s, p) => s + (p.noiseLevel ?? 3), 0) / recentPings.length;
  
  const studyCount = recentPings.filter(p => p.vibeTags.includes('good_for_studying')).length;
  const wifiCount = recentPings.filter(p => p.vibeTags.includes('wifi_good')).length;
  const socialCount = recentPings.filter(p => p.vibeTags.includes('social')).length;

  // Trend velocity = pings per hour
  const trendVelocity = recentPings.length / 3;

  // Vibe score = weighted combination of recency and activity
  const vibeScore = Math.min(100, 50 + trendVelocity * 5 + recentPings.length * 2);

  await prisma.place.update({
    where: { id: placeId },
    data: {
      avgCrowdLevel: avgCrowd,
      avgNoiseLevel: avgNoise,
      avgStudyScore: studyCount > 0 ? (studyCount / recentPings.length) * 5 : undefined,
      avgWifiScore: wifiCount > 0 ? (wifiCount / recentPings.length) * 5 : undefined,
      avgSocialScore: socialCount > 0 ? (socialCount / recentPings.length) * 5 : undefined,
      trendVelocity,
      vibeScore,
    },
  });
}
