import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const goals = await prisma.goal.findMany({
      where: { userId: session.id },
      include: {
        milestones: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Goals fetch error:', error);
    return NextResponse.json({ error: 'Maqsadlarni olishda xatolik' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      category = 'CAREER',
      timeframe = 'MONTHLY',
      priority = 'MEDIUM',
      targetDate,
      milestones = [],
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Maqsad sarlavhasi kiritilishi shart' }, { status: 400 });
    }

    const goal = await prisma.goal.create({
      data: {
        userId: session.id,
        title: title.trim(),
        description: description?.trim() || null,
        category,
        timeframe,
        priority,
        targetDate: targetDate ? new Date(targetDate) : null,
        milestones: {
          create: milestones.map((m: any) => ({
            title: typeof m === 'string' ? m : m.title,
            isCompleted: false,
          })),
        },
      },
      include: { milestones: true },
    });

    return NextResponse.json({ success: true, goal }, { status: 201 });
  } catch (error) {
    console.error('Goal create error:', error);
    return NextResponse.json({ error: 'Maqsad yaratishda xatolik' }, { status: 500 });
  }
}
