import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const grammars = await prisma.topikGrammar.findMany({
      orderBy: { level: 'asc' },
    });

    return NextResponse.json({
      grammars: grammars.map((g) => ({
        id: g.id,
        pattern: g.pattern,
        meaningUz: g.meaningUz,
        level: g.level,
        explanation: g.explanation,
        usageNote: g.usageNote,
        examples: JSON.parse(g.examplesJson || '[]'),
        practice: JSON.parse(g.practiceJson || '[]'),
        category: g.category,
      })),
    });
  } catch (error) {
    console.error('TOPIK Grammar error:', error);
    return NextResponse.json({ error: 'Grammatika ma’lumotlarini olishda xatolik' }, { status: 500 });
  }
}
