import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { parseTimeToMinutes, formatMinutesToTime, checkSleepConflict } from '@/lib/calculations/planner';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || new Date().toISOString().slice(0, 10);

    const startOfDay = new Date(dateParam);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateParam);
    endOfDay.setHours(23, 59, 59, 999);

    const userSchedule = await prisma.timeSchedule.findUnique({
      where: { userId: session.id },
    });

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.id,
        scheduledDate: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { startTime: 'asc' },
    });

    // Current time in minutes
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Separate fixed events and uncompleted flexible tasks
    const fixedTasks = tasks.filter((t) => t.isFixed && t.startTime && t.endTime);
    const pendingFlexibleTasks = tasks.filter((t) => !t.isFixed && t.status === 'PENDING');

    let scheduleCursor = Math.max(currentMinutes, parseTimeToMinutes(userSchedule?.wakeTime || '06:30'));
    // Round to next 5 or 15 minute slot
    scheduleCursor = Math.ceil(scheduleCursor / 15) * 15;

    const sleepMinutes = parseTimeToMinutes(userSchedule?.sleepTime || '23:00');
    const rescheduled = [];

    for (const task of pendingFlexibleTasks) {
      const duration = task.estimatedMinutes || 45;

      // Find an open slot that doesn't clash with fixed tasks
      let slotFound = false;
      while (!slotFound && scheduleCursor + duration <= sleepMinutes) {
        const potentialStart = scheduleCursor;
        const potentialEnd = scheduleCursor + duration;

        // Check if overlaps with any fixed task
        const clash = fixedTasks.some((ft) => {
          const fs = parseTimeToMinutes(ft.startTime!);
          const fe = parseTimeToMinutes(ft.endTime!);
          return potentialStart < fe && potentialEnd > fs;
        });

        if (!clash) {
          slotFound = true;
          const newStart = formatMinutesToTime(potentialStart);
          const newEnd = formatMinutesToTime(potentialEnd);

          await prisma.task.update({
            where: { id: task.id },
            data: {
              startTime: newStart,
              endTime: newEnd,
              status: 'PENDING',
            },
          });

          rescheduled.push({ id: task.id, title: task.title, newStart, newEnd });
          // Add 10 minutes buffer / break
          scheduleCursor = potentialEnd + 10;
        } else {
          // Advance cursor by 15 minutes
          scheduleCursor += 15;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `${rescheduled.length} ta vazifa yangi bo‘sh vaqt oralig‘iga muvaffaqiyatli qayta taqsimlandi.`,
      rescheduled,
    });
  } catch (error) {
    console.error('Recalculate error:', error);
    return NextResponse.json({ error: 'Jadvalni qayta hisoblashda xatolik' }, { status: 500 });
  }
}
