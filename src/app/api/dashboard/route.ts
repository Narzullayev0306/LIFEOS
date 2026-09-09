import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { calculateDynamicDailyLimit } from '@/lib/calculations/finance';
import { calculateDisciplineScore } from '@/lib/calculations/discipline';
import { parseTimeToMinutes } from '@/lib/calculations/planner';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const userId = session.id;
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const currentMonth = now.toISOString().slice(0, 7);

    // 1. User details & configurations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        timeSchedule: true,
        topikGoal: true,
        settings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }

    // 2. Today's Tasks
    const todayStart = new Date(todayStr);
    const todayEnd = new Date(todayStr);
    todayEnd.setHours(23, 59, 59, 999);

    const tasks = await prisma.task.findMany({
      where: {
        userId,
        OR: [
          { scheduledDate: { gte: todayStart, lte: todayEnd } },
          { createdAt: { gte: todayStart, lte: todayEnd } },
          { status: 'IN_PROGRESS' },
        ],
      },
      orderBy: { startTime: 'asc' },
    });

    // Determine current & next task
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let currentTask = tasks.find((t) => t.status === 'IN_PROGRESS');

    if (!currentTask && tasks.length > 0) {
      // Find task matching current time
      currentTask = tasks.find((t) => {
        if (!t.startTime || !t.endTime) return false;
        const s = parseTimeToMinutes(t.startTime);
        const e = parseTimeToMinutes(t.endTime);
        return currentMinutes >= s && currentMinutes <= e;
      });
      // Fallback to first uncompleted task
      if (!currentTask) {
        currentTask = tasks.find((t) => t.status === 'PENDING');
      }
    }

    let nextTask = null;
    if (currentTask) {
      const idx = tasks.findIndex((t) => t.id === currentTask!.id);
      nextTask = tasks.slice(idx + 1).find((t) => t.status === 'PENDING') || null;
    }

    // Day Progress (%) based on wake and sleep time
    const wakeMin = parseTimeToMinutes(user.timeSchedule?.wakeTime || '06:30');
    const sleepMin = parseTimeToMinutes(user.timeSchedule?.sleepTime || '23:00');
    const totalDayMin = sleepMin > wakeMin ? sleepMin - wakeMin : 1440 - wakeMin + sleepMin;
    const elapsedMin = Math.max(0, currentMinutes - wakeMin);
    const dayProgressPercent = Math.min(100, Math.max(0, Math.round((elapsedMin / totalDayMin) * 100)));

    // 3. TOPIK Progress & Countdown
    const topikGoal = user.topikGoal;
    let daysToExam = null;
    if (topikGoal?.examDate) {
      const diffTime = new Date(topikGoal.examDate).getTime() - now.getTime();
      daysToExam = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const todayReviewsCount = await prisma.vocabReviewLog.count({
      where: {
        userId,
        updatedAt: { gte: todayStart, lte: todayEnd },
      },
    });

    const todayStudySessions = await prisma.studySession.findMany({
      where: {
        userId,
        date: todayStr,
      },
    });
    const todayStudyMinutes = todayStudySessions.reduce((acc, s) => acc + s.durationMin, 0);

    // 4. Habits & Completions
    const habits = await prisma.habit.findMany({
      where: { userId, archived: false },
      include: {
        completions: {
          where: { date: todayStr },
        },
      },
    });

    const habitsCompletedToday = habits.filter((h) => h.completions.length > 0 && h.completions[0].completed).length;

    // 5. Finance Metrics
    const budgetRecord = await prisma.budget.findFirst({
      where: { userId, month: currentMonth },
    });
    const monthlyBudget = budgetRecord?.amount || 0;

    const currentMonthExpenses = await prisma.expense.findMany({
      where: {
        userId,
        date: { startsWith: currentMonth },
      },
    });
    const monthlyExpensesTotal = currentMonthExpenses.reduce((acc, e) => acc + e.amount, 0);

    const todayExpenses = currentMonthExpenses.filter((e) => e.date === todayStr);
    const todayExpensesTotal = todayExpenses.reduce((acc, e) => acc + e.amount, 0);

    const currentMonthIncomes = await prisma.income.findMany({
      where: {
        userId,
        date: { startsWith: currentMonth },
      },
    });
    const monthlyIncomeTotal = currentMonthIncomes.reduce((acc, i) => acc + i.amount, 0);

    // Calculate dynamic daily limit
    const dailyLimitData = calculateDynamicDailyLimit(monthlyBudget, monthlyExpensesTotal, now);

    // 6. Discipline Score Calculation
    const tasksTotal = tasks.length;
    const tasksCompleted = tasks.filter((t) => t.status === 'COMPLETED').length;

    const disciplineBreakdown = calculateDisciplineScore({
      tasksTotal,
      tasksCompleted,
      habitsTotal: habits.length,
      habitsCompleted: habitsCompletedToday,
      studyMinutesTarget: topikGoal?.dailyStudyMinutes || 90,
      studyMinutesActual: todayStudyMinutes,
      dailySpendLimit: dailyLimitData.dailyLimit,
      dailySpendActual: todayExpensesTotal,
    });

    // 7. Goals Overview
    const goals = await prisma.goal.findMany({
      where: { userId, status: 'IN_PROGRESS' },
      take: 3,
      orderBy: { priority: 'desc' },
      include: { milestones: true },
    });

    return NextResponse.json({
      userName: user.name,
      dayProgressPercent,
      currentTask,
      nextTask,
      tasksCount: { total: tasksTotal, completed: tasksCompleted },
      topik: {
        targetLevel: topikGoal?.targetLevel || 5,
        targetScore: topikGoal?.targetScore || 200,
        daysToExam,
        examDate: topikGoal?.examDate,
        dailyVocabTarget: topikGoal?.dailyVocabTarget || 25,
        vocabReviewedToday: todayReviewsCount,
        dailyStudyTarget: topikGoal?.dailyStudyMinutes || 90,
        studyMinutesToday: todayStudyMinutes,
      },
      discipline: disciplineBreakdown,
      habits: {
        total: habits.length,
        completed: habitsCompletedToday,
        items: habits.map((h) => ({
          id: h.id,
          name: h.name,
          color: h.color,
          category: h.category,
          currentStreak: h.currentStreak,
          completedToday: h.completions.length > 0 && h.completions[0].completed,
        })),
      },
      finance: {
        monthlyBudget,
        monthlyExpensesTotal,
        remainingBudget: dailyLimitData.remainingBudget,
        dynamicDailyLimit: dailyLimitData.dailyLimit,
        todayExpensesTotal,
        monthlyIncomeTotal,
        isOverBudget: dailyLimitData.isOverBudget,
        daysRemainingInMonth: dailyLimitData.daysRemaining,
      },
      goals: goals.map((g) => ({
        id: g.id,
        title: g.title,
        progress: g.progress,
        priority: g.priority,
        milestonesTotal: g.milestones.length,
        milestonesCompleted: g.milestones.filter((m) => m.isCompleted).length,
      })),
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    return NextResponse.json({ error: 'Dashboard ma’lumotlarini olishda xatolik' }, { status: 500 });
  }
}
