import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { type = 'VOCAB', durationMin = 30, notes } = await req.json();
    const todayStr = new Date().toISOString().slice(0, 10);

    const studySession = await prisma.studySession.create({
      data: {
        userId: session.id,
        type,
        durationMin: Number(durationMin),
        notes: notes?.trim() || null,
        date: todayStr,
      },
    });

    return NextResponse.json({ success: true, studySession });
  } catch (error) {
    console.error('Study session log error:', error);
    return NextResponse.json({ error: 'Mashg‘ulotni qayd etishda xatolik' }, { status: 500 });
  }
}
