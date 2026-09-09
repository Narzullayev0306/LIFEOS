import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { detectScheduleConflicts, checkSleepConflict } from '@/lib/calculations/planner';

export async function GET(req: Request) {
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

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.id,
        scheduledDate: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { startTime: 'asc' },
      include: { goal: true, recurringRule: true },
    });

    const userSchedule = await prisma.timeSchedule.findUnique({
      where: { userId: session.id },
    });

    // Detect conflicts among tasks with start and end times
    const slots = tasks
      .filter((t) => t.startTime && t.endTime)
      .map((t) => ({
        id: t.id,
        title: t.title,
        startTime: t.startTime!,
        endTime: t.endTime!,
        isFixed: t.isFixed,
      }));

    const conflicts = detectScheduleConflicts(slots);

    // Check sleep clashes
    const sleepClashes = slots
      .map((slot) => {
        const check = checkSleepConflict(
          slot.startTime,
          slot.endTime,
          userSchedule?.sleepTime || '23:00',
          userSchedule?.wakeTime || '06:30'
        );
        return check.conflicts ? { slotId: slot.id, message: check.message } : null;
      })
      .filter(Boolean);

    return NextResponse.json({
      tasks,
      conflicts,
      sleepClashes,
      schedule: userSchedule,
    });
  } catch (error) {
    console.error('Tasks fetch error:', error);
    return NextResponse.json({ error: 'Vazifalarni olishda xatolik' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      priority = 'MEDIUM',
      category = 'GENERAL',
      estimatedMinutes = 30,
      scheduledDate,
      startTime,
      endTime,
      isFixed = false,
      goalId,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Vazifa sarlavhasi kiritilishi shart' }, { status: 400 });
    }

    const taskDate = scheduledDate ? new Date(scheduledDate) : new Date();

    const task = await prisma.task.create({
      data: {
        userId: session.id,
        title: title.trim(),
        description: description?.trim() || null,
        priority,
        category,
        estimatedMinutes: Number(estimatedMinutes),
        scheduledDate: taskDate,
        startTime: startTime || null,
        endTime: endTime || null,
        isFixed: Boolean(isFixed),
        goalId: goalId || null,
      },
    });

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error) {
    console.error('Task create error:', error);
    return NextResponse.json({ error: 'Vazifa yaratishda xatolik yuz berdi' }, { status: 500 });
  }
}
