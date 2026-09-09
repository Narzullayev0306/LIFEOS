import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { month, amount } = await req.json();
    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const budget = await prisma.budget.upsert({
      where: {
        userId_month: {
          userId: session.id,
          month: targetMonth,
        },
      },
      update: { amount: Number(amount) },
      create: {
        userId: session.id,
        month: targetMonth,
        amount: Number(amount),
      },
    });

    return NextResponse.json({ success: true, budget });
  } catch (error) {
    console.error('Budget update error:', error);
    return NextResponse.json({ error: 'Byudjetni saqlashda xatolik' }, { status: 500 });
  }
}
