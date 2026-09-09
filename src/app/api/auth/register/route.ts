import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { AUTH_COOKIE_NAME } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, parol va ism kiritilishi shart.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Parol kamida 6 ta belgidan iborat bo‘lishi kerak.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Ushbu email bilan ro‘yxatdan o‘tilgan.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        settings: {
          create: {
            timezone: 'Asia/Tashkent',
            locale: 'uz-UZ',
            theme: 'dark',
            currency: 'UZS',
            onboardingCompleted: false,
          },
        },
        timeSchedule: {
          create: {
            wakeTime: '06:30',
            sleepTime: '23:00',
            workStartTime: '09:00',
            workEndTime: '18:00',
            studyStartTime: '19:30',
            studyEndTime: '21:30',
          },
        },
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: { id: user.id, email: user.email, name: user.name, onboardingCompleted: false },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Serverda xatolik yuz berdi.' }, { status: 500 });
  }
}
