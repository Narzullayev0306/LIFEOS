import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      displayName: true,
      avatar: true,
      coverImage: true,
      coverPreset: true,
      bio: true,
      occupation: true,
      education: true,
      location: true,
      birthday: true,
      phone: true,
      createdAt: true,
      settings: true,
      privacy: true,
      timeSchedule: true,
      topikGoal: true,
    },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
