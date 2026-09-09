import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tmagan' }, { status: 401 });
    }

    const data = await req.json();
    const {
      wakeTime = '06:30',
      sleepTime = '23:00',
      workStartTime = '09:00',
      workEndTime = '18:00',
      studyStartTime = '19:30',
      studyEndTime = '21:30',
      fixedBlocks = [],
      topikLevel = 5,
      topikScore = 200,
      examDate,
      dailyVocabTarget = 25,
      dailyStudyMinutes = 90,
      monthlyBudget = 4500000,
      monthlyIncomeTarget = 8000000,
      selectedHabits = [],
      notificationsEnabled = true,
    } = data;

    // 1. Update Settings & Onboarding Completed
    await prisma.userSettings.upsert({
      where: { userId: session.id },
      update: {
        onboardingCompleted: true,
        notificationsEnabled,
      },
      create: {
        userId: session.id,
        onboardingCompleted: true,
        notificationsEnabled,
      },
    });

    // 2. Update Time Schedule
    await prisma.timeSchedule.upsert({
      where: { userId: session.id },
      update: {
        wakeTime,
        sleepTime,
        workStartTime,
        workEndTime,
        studyStartTime,
        studyEndTime,
        fixedBlocksJson: JSON.stringify(fixedBlocks),
      },
      create: {
        userId: session.id,
        wakeTime,
        sleepTime,
        workStartTime,
        workEndTime,
        studyStartTime,
        studyEndTime,
        fixedBlocksJson: JSON.stringify(fixedBlocks),
      },
    });

    // 3. Update TOPIK Goal
    await prisma.topikGoal.upsert({
      where: { userId: session.id },
      update: {
        targetLevel: Number(topikLevel),
        targetScore: Number(topikScore),
        examDate: examDate ? new Date(examDate) : null,
        dailyVocabTarget: Number(dailyVocabTarget),
        dailyStudyMinutes: Number(dailyStudyMinutes),
      },
      create: {
        userId: session.id,
        targetLevel: Number(topikLevel),
        targetScore: Number(topikScore),
        examDate: examDate ? new Date(examDate) : null,
        dailyVocabTarget: Number(dailyVocabTarget),
        dailyStudyMinutes: Number(dailyStudyMinutes),
      },
    });

    // 4. Financial Targets (Budget & Goal)
    const currentMonth = new Date().toISOString().slice(0, 7);
    await prisma.budget.upsert({
      where: {
        userId_month: {
          userId: session.id,
          month: currentMonth,
        },
      },
      update: { amount: Number(monthlyBudget) },
      create: {
        userId: session.id,
        month: currentMonth,
        amount: Number(monthlyBudget),
      },
    });

    if (monthlyIncomeTarget > 0) {
      await prisma.financialGoal.create({
        data: {
          userId: session.id,
          title: 'Oylik daromad maqsadi',
          targetAmount: Number(monthlyIncomeTarget),
          category: 'SAVINGS',
        },
      });
    }

    // 5. Create selected habits
    if (Array.isArray(selectedHabits) && selectedHabits.length > 0) {
      for (const h of selectedHabits) {
        await prisma.habit.create({
          data: {
            userId: session.id,
            name: h.name,
            category: h.category || 'HEALTH',
            frequency: 'DAILY',
            color: h.color || '#10b981',
          },
        });
      }
    }

    // 6. Generate Initial Plan (Day 1 Schedule)
    const initialTasks = [
      {
        title: 'Ertalabki reja va diqqatni jamlash (LIFEOS)',
        startTime: wakeTime,
        endTime: '07:15',
        priority: 'HIGH',
        category: 'DISCIPLINE',
        isFixed: true,
      },
      {
        title: 'Asosiy faoliyat / Ish blok 1',
        startTime: workStartTime,
        endTime: '13:00',
        priority: 'URGENT',
        category: 'WORK',
      },
      {
        title: 'Tushlik va qisqa dam olish',
        startTime: '13:00',
        endTime: '14:00',
        priority: 'LOW',
        category: 'HEALTH',
        isFixed: true,
      },
      {
        title: 'Asosiy faoliyat / Ish blok 2',
        startTime: '14:00',
        endTime: workEndTime,
        priority: 'HIGH',
        category: 'WORK',
      },
      {
        title: `TOPIK II intensiv tayyorgarlik (${dailyStudyMinutes} min)`,
        startTime: studyStartTime,
        endTime: studyEndTime,
        priority: 'URGENT',
        category: 'STUDY',
      },
      {
        title: 'Kechki tahlil, xarajatlar va ertangi kun rejasi',
        startTime: '22:00',
        endTime: '22:45',
        priority: 'MEDIUM',
        category: 'DISCIPLINE',
      },
    ];

    for (const t of initialTasks) {
      await prisma.task.create({
        data: {
          userId: session.id,
          title: t.title,
          startTime: t.startTime,
          endTime: t.endTime,
          priority: t.priority,
          category: t.category,
          isFixed: t.isFixed || false,
          scheduledDate: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding yakunlandi va boshlang‘ich reja yaratildi.',
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Onboarding ma’lumotlarini saqlashda xatolik yuz berdi.' }, { status: 500 });
  }
}
