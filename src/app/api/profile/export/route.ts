import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const userId = session.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        privacy: true,
        timeSchedule: true,
        tasks: {
          include: { timeBlocks: true, reminders: true },
        },
        habits: {
          include: { completions: true },
        },
        disciplineScores: true,
        goals: {
          include: { milestones: true },
        },
        topikGoal: true,
        studySessions: true,
        topikResults: true,
        vocabReviews: true,
        incomes: true,
        expenses: {
          include: { category: true },
        },
        budgets: true,
        financialGoals: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }

    // Exclude security sensitive passwordHash from export
    const { passwordHash, ...safeUserData } = user;

    const exportPayload = {
      exportVersion: '1.0.0',
      exportedAt: new Date().toISOString(),
      system: 'LIFEOS Personal Operating System',
      data: safeUserData,
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `lifeos-backup-${user.username || 'user'}-${dateStr}.json`;

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json({ error: 'Ma’lumotlarni eksport qilishda xatolik yuz berdi' }, { status: 500 });
  }
}
