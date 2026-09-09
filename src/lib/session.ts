import { cookies } from 'next/headers';
import { verifyToken, SessionPayload } from './auth';
import { prisma } from './prisma';

export const AUTH_COOKIE_NAME = 'lifeos_session';

export async function getCurrentUser(): Promise<(SessionPayload & { id: string }) | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) return null;

    return {
      ...payload,
      id: user.id,
    };
  } catch {
    return null;
  }
}
