import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { habitId, date } = await req.json();
    const targetDate = date || new Date().toISOString().slice(0, 10);

    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
      include: { completions: true },
    });

    if (!habit || habit.userId !== session.id) {
      return NextResponse.json({ error: 'Odat topilmadi' }, { status: 404 });
    }

    const existingCompletion = await prisma.habitCompletion.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: targetDate,
        },
      },
    });

    let isCompletedNow = true;
    if (existingCompletion) {
      isCompletedNow = !existingCompletion.completed;
      await prisma.habitCompletion.update({
        where: { id: existingCompletion.id },
        data: { completed: isCompletedNow },
      });
    } else {
      await prisma.habitCompletion.create({
        data: {
          habitId,
          userId: session.id,
          date: targetDate,
          completed: true,
        },
      });
    }

    // Recalculate streak
    let currentStreak = habit.currentStreak;
    if (isCompletedNow) {
      currentStreak += 1;
    } else {
      currentStreak = Math.max(0, currentStreak - 1);
    }
    const bestStreak = Math.max(habit.bestStreak, currentStreak);

    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: { currentStreak, bestStreak },
    });

    return NextResponse.json({
      success: true,
      completed: isCompletedNow,
      habit: updatedHabit,
    });
  } catch (error) {
    console.error('Habit completion error:', error);
    return NextResponse.json({ error: 'Odatni belgilashda xatolik' }, { status: 500 });
  }
}
