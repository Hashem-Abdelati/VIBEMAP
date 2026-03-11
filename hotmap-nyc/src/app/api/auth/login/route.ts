// src/app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return apiError('Invalid credentials');

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true, trustScore: true },
    });

    if (!user) return apiError('Invalid credentials', 401);

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) return apiError('Invalid credentials', 401);

    const token = signToken({ userId: user.id, username: user.username, email: user.email });
    setAuthCookie(token);

    return apiSuccess({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profile: user.profile,
        trustScore: user.trustScore,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return apiError('Internal server error', 500);
  }
}
