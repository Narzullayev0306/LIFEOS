import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const prompts = await prisma.writingPrompt.findMany({
      orderBy: { promptNumber: 'asc' },
      include: {
        practices: {
          where: { userId: session.id },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      prompts: prompts.map((p) => ({
        id: p.id,
        promptNumber: p.promptNumber,
        title: p.title,
        description: p.description,
        instructions: p.instructions,
        sampleAnswer: p.sampleAnswer,
        rubric: JSON.parse(p.rubricJson || '{}'),
        practices: p.practices,
      })),
    });
  } catch (error) {
    console.error('TOPIK Writing error:', error);
    return NextResponse.json({ error: 'Yozish topshiriqlarini olishda xatolik' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { promptId, submission, selfScore, feedback } = await req.json();

    if (!promptId || !submission) {
      return NextResponse.json({ error: 'Matn va topshiriq talab qilinadi' }, { status: 400 });
    }

    const practice = await prisma.writingPractice.create({
      data: {
        userId: session.id,
        promptId,
        submission: submission.trim(),
        selfScore: selfScore ? Number(selfScore) : null,
        feedback: feedback?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, practice });
  } catch (error) {
    console.error('TOPIK Writing submission error:', error);
    return NextResponse.json({ error: 'Yozma ishni saqlashda xatolik' }, { status: 500 });
  }
}
