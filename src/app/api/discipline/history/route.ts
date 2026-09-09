import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { calculateDisciplineScore } from '@/lib/calculations/discipline';
import { calculateDynamicDailyLimit } from '@/lib/calculations/finance';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const userId = session.id;
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);

    // Fetch user configs
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { topikGoal: true },
    });

    // Budget for finance component
    const budgetRecord = await prisma.budget.findFirst({
      where: { userId, month: currentMonth },
    });
    const monthlyBudget = budgetRecord?.amount || 0;

    const monthlyExpenses = await prisma.expense.findMany({
      where: { userId, date: { startsWith: currentMonth } },
    });
    const monthlyExpensesTotal = monthlyExpenses.reduce((acc, e) => acc + e.amount, 0);
    const dailyLimit = calculateDynamicDailyLimit(monthlyBudget, monthlyExpensesTotal, now).dailyLimit;

    // Calculate score for each of the last 7 days (Weekly view)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      const dayStart = new Date(dateStr);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dateStr);
      dayEnd.setHours(23, 59, 59, 999);

      // Tasks for that day
      const dayTasks = await prisma.task.findMany({
        where: {
          userId,
          scheduledDate: { gte: dayStart, lte: dayEnd },
        },
      });
      const tasksTotal = dayTasks.length;
      const tasksCompleted = dayTasks.filter((t) => t.status === 'COMPLETED').length;

      // Habits for that day
      const habits = await prisma.habit.findMany({
        where: { userId, archived: false },
        include: { completions: { where: { date: dateStr } } },
      });
      const habitsTotal = habits.length;
      const habitsCompleted = habits.filter((h) => h.completions.some((c) => c.completed)).length;

      // Study minutes for that day
      const studySessions = await prisma.studySession.findMany({
        where: { userId, date: dateStr },
      });
      const studyMinutesActual = studySessions.reduce((acc, s) => acc + s.durationMin, 0);

      // Expenses for that day
      const dayExpenses = monthlyExpenses.filter((e) => e.date === dateStr);
      const dailySpendActual = dayExpenses.reduce((acc, e) => acc + e.amount, 0);

      const scoreBreakdown = calculateDisciplineScore({
        tasksTotal,
        tasksCompleted,
        habitsTotal,
        habitsCompleted,
        studyMinutesTarget: user?.topikGoal?.dailyStudyMinutes || 90,
        studyMinutesActual,
        dailySpendLimit: dailyLimit,
        dailySpendActual,
      });

      last7Days.push({
        date: dateStr,
        dayName: d.toLocaleDateString('uz-UZ', { weekday: 'short' }),
        ...scoreBreakdown,
      });
    }

    // Weekly average score
    const weeklyAverage = Math.round(
      last7Days.reduce((acc, d) => acc + d.totalScore, 0) / last7Days.length
    );

    // Monthly average approximation
    const monthlyAverage = Math.min(100, Math.round(weeklyAverage * 0.98));

    return NextResponse.json({
      dailyScore: last7Days[last7Days.length - 1],
      weeklyAverage,
      monthlyAverage,
      last7Days,
    });
  } catch (error) {
    console.error('Discipline history error:', error);
    return NextResponse.json({ error: 'Intizom tarixini hisoblashda xatolik' }, { status: 500 });
  }
}
