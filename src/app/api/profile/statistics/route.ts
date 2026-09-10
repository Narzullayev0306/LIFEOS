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
    const todayStr = now.toISOString().slice(0, 10);
    const currentMonth = now.toISOString().slice(0, 7);

    // 1. User & Goals
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        topikGoal: true,
        privacy: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Foydalanuvchi topilmadi' }, { status: 404 });
    }

    // 2. Tasks Statistics
    const allTasks = await prisma.task.findMany({
      where: { userId },
      select: { id: true, status: true, title: true, completedAt: true, createdAt: true },
      orderBy: { completedAt: 'desc' },
    });
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED').length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 3. Habits Statistics & Streaks
    const habits = await prisma.habit.findMany({
      where: { userId, archived: false },
      include: {
        completions: {
          where: { date: todayStr },
        },
      },
    });
    const totalHabits = habits.length;
    const completedHabitsToday = habits.filter((h) => h.completions.length > 0 && h.completions[0].completed).length;
    const currentStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak)) : 0;
    const bestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.bestStreak)) : 0;

    // 4. Goals & Milestones
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: { milestones: true },
    });
    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.progress >= 100).length;
    const allMilestones = goals.flatMap((g) => g.milestones);
    const totalMilestones = allMilestones.length;
    const completedMilestones = allMilestones.filter((m) => m.isCompleted).length;

    // 5. TOPIK & Study Statistics
    const studySessions = await prisma.studySession.findMany({
      where: { userId },
      select: { durationMin: true, date: true, type: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    const totalStudySessions = studySessions.length;
    const totalStudyMinutes = studySessions.reduce((acc, s) => acc + s.durationMin, 0);
    const totalVocabReviews = await prisma.vocabReviewLog.count({
      where: { userId },
    });

    // 6. Finance
    const budget = await prisma.budget.findFirst({
      where: { userId, month: currentMonth },
    });
    const monthlyBudget = budget?.amount || 0;

    const monthlyExpenses = await prisma.expense.findMany({
      where: { userId, date: { startsWith: currentMonth } },
    });
    const totalMonthlySpent = monthlyExpenses.reduce((acc, e) => acc + e.amount, 0);
    const remainingBudget = Math.max(0, monthlyBudget - totalMonthlySpent);
    const dailyLimit = calculateDynamicDailyLimit(monthlyBudget, totalMonthlySpent, now);

    // 7. Discipline Score
    const todayTasks = allTasks.filter((t) => {
      const d = t.completedAt ? t.completedAt.toISOString().slice(0, 10) : t.createdAt.toISOString().slice(0, 10);
      return d === todayStr;
    });
    const todayTasksCompleted = todayTasks.filter((t) => t.status === 'COMPLETED').length;
    const todayStudyMinutes = studySessions
      .filter((s) => s.date === todayStr)
      .reduce((acc, s) => acc + s.durationMin, 0);

    const disciplineBreakdown = calculateDisciplineScore({
      tasksTotal: todayTasks.length,
      tasksCompleted: todayTasksCompleted,
      habitsTotal: totalHabits,
      habitsCompleted: completedHabitsToday,
      studyMinutesTarget: user.topikGoal?.dailyStudyMinutes || 60,
      studyMinutesActual: todayStudyMinutes,
      dailySpendLimit: dailyLimit.dailyLimit,
      dailySpendActual: monthlyExpenses.filter((e) => e.date === todayStr).reduce((acc, e) => acc + e.amount, 0),
    });

    // 8. Recent Activity Feed (Unified stream of real events)
    const recentActivities: Array<{
      id: string;
      type: 'TASK' | 'HABIT' | 'STUDY' | 'GOAL';
      title: string;
      description?: string;
      timestamp: string;
    }> = [];

    // Recent tasks
    allTasks
      .filter((t) => t.status === 'COMPLETED' && t.completedAt)
      .slice(0, 5)
      .forEach((t) => {
        recentActivities.push({
          id: `task-${t.id}`,
          type: 'TASK',
          title: `Vazifa bajarildi: ${t.title}`,
          timestamp: t.completedAt!.toISOString(),
        });
      });

    // Recent study sessions
    studySessions.slice(0, 4).forEach((s, idx) => {
      recentActivities.push({
        id: `study-${idx}`,
        type: 'STUDY',
        title: `${s.type || 'TOPIK II'} darsi`,
        description: `${s.durationMin} daqiqa o‘rganildi`,
        timestamp: s.createdAt.toISOString(),
      });
    });

    // Sort unified activities by timestamp desc
    recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      streak: {
        current: currentStreak,
        best: bestStreak,
      },
      discipline: {
        score: disciplineBreakdown.totalScore,
        breakdown: disciplineBreakdown,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        completionRate: taskCompletionRate,
      },
      habits: {
        total: totalHabits,
        completedToday: completedHabitsToday,
      },
      goals: {
        total: totalGoals,
        completed: completedGoals,
        milestonesTotal: totalMilestones,
        milestonesCompleted: completedMilestones,
      },
      topik: {
        targetLevel: user.topikGoal?.targetLevel || 5,
        targetScore: user.topikGoal?.targetScore || 210,
        currentScore: user.topikGoal?.currentScore || 0,
        examDate: user.topikGoal?.examDate || null,
        totalStudyMinutes,
        totalStudySessions,
        totalVocabReviews,
      },
      finance: {
        monthlyBudget,
        totalMonthlySpent,
        remainingBudget,
        dailyLimit: dailyLimit.dailyLimit,
        isOverBudget: dailyLimit.isOverBudget,
      },
      recentActivities: recentActivities.slice(0, 8),
    });
  } catch (error) {
    console.error('Profile statistics error:', error);
    return NextResponse.json({ error: 'Statistikani yuklashda xatolik yuz berdi' }, { status: 500 });
  }
}
