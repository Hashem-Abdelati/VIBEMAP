// src/app/api/auth/signup/route.ts
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api';

const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  borough: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    
    if (!parsed.success) {
      return apiError(parsed.error.errors[0].message);
    }

    const { email, username, password, borough, interests } = parsed.data;

    // Check duplicates
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existing) {
      return apiError(existing.email === email ? 'Email already in use' : 'Username already taken');
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        profile: {
          create: {
            borough: borough as any,
            interests: interests || [],
          },
        },
        trustScore: {
          create: {
            score: 0,
            badge: 'NEW_CONTRIBUTOR',
          },
        },
      },
      include: { profile: true, trustScore: true },
    });

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
    }, 201);
  } catch (error) {
    console.error('Signup error:', error);
    return apiError('Internal server error', 500);
  }
}
