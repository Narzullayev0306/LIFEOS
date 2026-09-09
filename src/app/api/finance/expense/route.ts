import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const body = await req.json();
    const { amount, categoryId, description, date } = body;

    if (!amount || !categoryId) {
      return NextResponse.json({ error: 'Miqdor va kategoriya kiritilishi shart' }, { status: 400 });
    }

    const expenseDate = date || new Date().toISOString().slice(0, 10);

    const expense = await prisma.expense.create({
      data: {
        userId: session.id,
        categoryId,
        amount: Number(amount),
        description: description?.trim() || null,
        date: expenseDate,
      },
    });

    return NextResponse.json({ success: true, expense }, { status: 201 });
  } catch (error) {
    console.error('Expense create error:', error);
    return NextResponse.json({ error: 'Xarajatni saqlashda xatolik' }, { status: 500 });
  }
}
