import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const goals = await prisma.financialGoal.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Financial goals error:', error);
    return NextResponse.json({ error: 'Moliyaviy maqsadlarni olishda xatolik' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { title, targetAmount, currentAmount = 0, category = 'SAVINGS' } = await req.json();

    if (!title || !targetAmount) {
      return NextResponse.json({ error: 'Sarlavha va maqsad summasi kiritilishi shart' }, { status: 400 });
    }

    const goal = await prisma.financialGoal.create({
      data: {
        userId: session.id,
        title: title.trim(),
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount),
        category,
      },
    });

    return NextResponse.json({ success: true, goal }, { status: 201 });
  } catch (error) {
    console.error('Financial goal create error:', error);
    return NextResponse.json({ error: 'Maqsadni yaratishda xatolik' }, { status: 500 });
  }
}
