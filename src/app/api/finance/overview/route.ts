import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import {
  calculateDynamicDailyLimit,
  calculateIncomeProgress,
} from '@/lib/calculations/finance';

export async function GET(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const currentMonth = searchParams.get('month') || now.toISOString().slice(0, 7);
    const todayStr = now.toISOString().slice(0, 10);

    // 1. Monthly Budget
    const budgetRecord = await prisma.budget.findFirst({
      where: { userId: session.id, month: currentMonth },
    });
    const monthlyBudget = budgetRecord?.amount || 0;

    // 2. Expenses for month
    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.id,
        date: { startsWith: currentMonth },
      },
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    const monthlyExpensesTotal = expenses.reduce((acc, e) => acc + e.amount, 0);
    const todayExpenses = expenses.filter((e) => e.date === todayStr);
    const todayExpensesTotal = todayExpenses.reduce((acc, e) => acc + e.amount, 0);

    // 3. Incomes for month
    const incomes = await prisma.income.findMany({
      where: {
        userId: session.id,
        date: { startsWith: currentMonth },
      },
      orderBy: { date: 'desc' },
    });
    const monthlyIncomeTotal = incomes.reduce((acc, i) => acc + i.amount, 0);

    // 4. Financial Goal (Income target & Savings)
    const incomeGoal = await prisma.financialGoal.findFirst({
      where: { userId: session.id, title: { contains: 'daromad' } },
    });
    const targetIncome = incomeGoal?.targetAmount || 8000000;

    const savingsGoals = await prisma.financialGoal.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'asc' },
    });

    // 5. Deterministic Calculations
    const dailyLimitData = calculateDynamicDailyLimit(monthlyBudget, monthlyExpensesTotal, now);
    const incomeProgressData = calculateIncomeProgress(targetIncome, monthlyIncomeTotal, now);

    // 6. Category breakdown
    const categoryTotals: Record<string, { name: string; color: string; amount: number }> = {};
    for (const exp of expenses) {
      const catName = exp.category?.name || 'Boshqa';
      const catColor = exp.category?.color || '#64748b';
      if (!categoryTotals[catName]) {
        categoryTotals[catName] = { name: catName, color: catColor, amount: 0 };
      }
      categoryTotals[catName].amount += exp.amount;
    }

    const categoryBreakdown = Object.values(categoryTotals).map((cat) => ({
      ...cat,
      percent:
        monthlyExpensesTotal > 0 ? Math.round((cat.amount / monthlyExpensesTotal) * 100) : 0,
    }));

    // Categories list for dropdown
    const categories = await prisma.expenseCategory.findMany({
      where: { userId: session.id },
    });

    return NextResponse.json({
      currentMonth,
      monthlyBudget,
      monthlyExpensesTotal,
      todayExpensesTotal,
      monthlyIncomeTotal,
      dailyLimitData,
      incomeProgressData,
      categoryBreakdown,
      categories,
      expenses,
      incomes,
      savingsGoals,
    });
  } catch (error) {
    console.error('Finance overview error:', error);
    return NextResponse.json({ error: 'Moliya ma’lumotlarini olishda xatolik' }, { status: 500 });
  }
}
