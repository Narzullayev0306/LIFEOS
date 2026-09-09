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
    const { source, amount, description, date } = body;

    if (!source || !amount) {
      return NextResponse.json({ error: 'Manba va miqdor kiritilishi shart' }, { status: 400 });
    }

    const incomeDate = date || new Date().toISOString().slice(0, 10);

    const income = await prisma.income.create({
      data: {
        userId: session.id,
        source: source.trim(),
        amount: Number(amount),
        description: description?.trim() || null,
        date: incomeDate,
      },
    });

    return NextResponse.json({ success: true, income }, { status: 201 });
  } catch (error) {
    console.error('Income create error:', error);
    return NextResponse.json({ error: 'Daromadni saqlashda xatolik' }, { status: 500 });
  }
}
