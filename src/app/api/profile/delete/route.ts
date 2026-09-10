import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { AUTH_COOKIE_NAME } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { password, confirmationText } = await req.json();

    if (!password) {
      return NextResponse.json({ error: 'Tasdiqlash uchun joriy parolingizni kiriting' }, { status: 400 });
    }

    if (confirmationText !== 'DELETE' && confirmationText !== 'OCHIRISH') {
      return NextResponse.json(
        { error: 'Hisobni o‘chirish uchun "DELETE" deb yozib tasdiqlang' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Noto‘g‘ri parol kiritildi' }, { status: 400 });
    }

    // Delete user from database (Cascades delete on tasks, habits, etc.)
    await prisma.user.delete({
      where: { id: session.id },
    });

    // Clear session cookie
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);

    return NextResponse.json({
      success: true,
      message: 'Hisobingiz va barcha ma’lumotlaringiz butunlay o‘chirildi',
    });
  } catch (error) {
    console.error('Account delete error:', error);
    return NextResponse.json({ error: 'Hisobni o‘chirishda server xatoligi yuz berdi' }, { status: 500 });
  }
}
