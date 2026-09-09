import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { runAiAnalysis, sanitizePrompt } from '@/lib/ai/provider';
import { calculateDynamicDailyLimit } from '@/lib/calculations/finance';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { feature = 'DAILY_SUMMARY', userPrompt, actionPayload, executeAction } = await req.json();

    // If user is confirming execution of an AI proposed action
    if (executeAction && actionPayload) {
      if (actionPayload.action === 'recalculate') {
        // Trigger schedule recalculation
        const recalculateRes = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/planner/recalculate`,
          { method: 'POST', headers: { Cookie: req.headers.get('cookie') || '' } }
        );
        return NextResponse.json({
          success: true,
          message: 'Amal foydalanuvchi tasdig‘i bilan muvaffaqiyatli bajarildi.',
        });
      }
    }

    // Gather contextual data for analysis
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonth = new Date().toISOString().slice(0, 7);

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        topikGoal: true,
        timeSchedule: true,
      },
    });

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.id,
        scheduledDate: {
          gte: new Date(todayStr),
          lte: new Date(new Date(todayStr).getTime() + 86400000),
        },
      },
    });

    const budget = await prisma.budget.findFirst({
      where: { userId: session.id, month: currentMonth },
    });
    const expenses = await prisma.expense.findMany({
      where: { userId: session.id, date: { startsWith: currentMonth } },
    });
    const monthlyExpensesTotal = expenses.reduce((acc, e) => acc + e.amount, 0);
    const todayExpenses = expenses.filter((e) => e.date === todayStr);
    const todayExpensesTotal = todayExpenses.reduce((acc, e) => acc + e.amount, 0);

    const dailyLimit = calculateDynamicDailyLimit(
      budget?.amount || 0,
      monthlyExpensesTotal
    ).dailyLimit;

    const analysis = await runAiAnalysis({
      feature,
      userData: {
        tasks,
        topikGoal: user?.topikGoal,
        dailyLimit,
        todayExpensesTotal,
        isOverBudget: monthlyExpensesTotal > (budget?.amount || 0),
        daysToExam: user?.topikGoal?.examDate
          ? Math.ceil(
              (new Date(user.topikGoal.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
          : null,
      },
      userPrompt: sanitizePrompt(userPrompt || ''),
    });

    // Save AI Log audit record
    await prisma.aiLog.create({
      data: {
        userId: session.id,
        feature,
        prompt: userPrompt || feature,
        response: JSON.stringify(analysis),
        requiresAction: !!analysis.proposedAction,
        actionPayload: analysis.proposedAction ? JSON.stringify(analysis.proposedAction) : null,
      },
    });

    return NextResponse.json({ success: true, analysis });
  } catch (error) {
    console.error('AI Analyze error:', error);
    return NextResponse.json({ error: 'AI tahlilida xatolik yuz berdi' }, { status: 500 });
  }
}
