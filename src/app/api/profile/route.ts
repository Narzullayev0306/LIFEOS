import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      settings: true,
      timeSchedule: true,
      topikGoal: true,
    },
  });

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const body = await req.json();
    const { name, password, settings, timeSchedule } = body;

    const updateData: { name?: string; passwordHash?: string } = {};
    if (name) updateData.name = name.trim();
    if (password && password.length >= 6) {
      updateData.passwordHash = await hashPassword(password);
    }

    await prisma.user.update({
      where: { id: session.id },
      data: updateData,
    });

    if (settings) {
      await prisma.userSettings.upsert({
        where: { userId: session.id },
        update: {
          timezone: settings.timezone,
          locale: settings.locale,
          theme: settings.theme,
          currency: settings.currency,
          notificationsEnabled: settings.notificationsEnabled,
          taskReminders: settings.taskReminders,
          studyReminders: settings.studyReminders,
          habitReminders: settings.habitReminders,
          expenseReminders: settings.expenseReminders,
          reviewReminders: settings.reviewReminders,
        },
        create: {
          userId: session.id,
          timezone: settings.timezone || 'Asia/Tashkent',
          locale: settings.locale || 'uz-UZ',
          theme: settings.theme || 'dark',
          currency: settings.currency || 'UZS',
        },
      });
    }

    if (timeSchedule) {
      await prisma.timeSchedule.upsert({
        where: { userId: session.id },
        update: {
          wakeTime: timeSchedule.wakeTime,
          sleepTime: timeSchedule.sleepTime,
          workStartTime: timeSchedule.workStartTime,
          workEndTime: timeSchedule.workEndTime,
          studyStartTime: timeSchedule.studyStartTime,
          studyEndTime: timeSchedule.studyEndTime,
        },
        create: {
          userId: session.id,
          wakeTime: timeSchedule.wakeTime || '06:30',
          sleepTime: timeSchedule.sleepTime || '23:00',
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Profil muvaffaqiyatli yangilandi' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Profilni saqlashda xatolik yuz berdi' }, { status: 500 });
  }
}
