import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().slice(0, 10);

    const habits = await prisma.habit.findMany({
      where: { userId: session.id, archived: false },
      include: {
        completions: {
          where: { date: { gte: thirtyDaysAgoStr } },
          orderBy: { date: 'desc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      habits: habits.map((h) => ({
        id: h.id,
        name: h.name,
        description: h.description,
        category: h.category,
        frequency: h.frequency,
        targetDays: h.targetDays,
        color: h.color,
        icon: h.icon,
        currentStreak: h.currentStreak,
        bestStreak: h.bestStreak,
        completedToday: h.completions.some((c) => c.date === todayStr && c.completed),
        recentCompletions: h.completions,
      })),
    });
  } catch (error) {
    console.error('Habits fetch error:', error);
    return NextResponse.json({ error: 'Odatlarni olishda xatolik' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, category = 'HEALTH', frequency = 'DAILY', color = '#10b981' } = body;

    if (!name) {
      return NextResponse.json({ error: 'Odat nomi kiritilishi shart' }, { status: 400 });
    }

    const habit = await prisma.habit.create({
      data: {
        userId: session.id,
        name: name.trim(),
        description: description?.trim() || null,
        category,
        frequency,
        color,
      },
    });

    return NextResponse.json({ success: true, habit }, { status: 201 });
  } catch (error) {
    console.error('Habit create error:', error);
    return NextResponse.json({ error: 'Odat yaratishda xatolik' }, { status: 500 });
  }
}
