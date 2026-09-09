import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode'); // 'due' for spaced repetition review or 'all'
    const level = searchParams.get('level');

    const whereVocab: any = {};
    if (level && level !== 'all') {
      whereVocab.level = Number(level);
    }

    if (mode === 'due') {
      // Due reviews for this user
      const now = new Date();
      const reviews = await prisma.vocabReviewLog.findMany({
        where: {
          userId: session.id,
          nextReviewDate: { lte: now },
        },
        include: { vocab: true },
        take: 30,
      });

      // If fewer than 10 reviews due, fetch some new unreviewed words
      if (reviews.length < 10) {
        const reviewedIds = (
          await prisma.vocabReviewLog.findMany({
            where: { userId: session.id },
            select: { vocabId: true },
          })
        ).map((r) => r.vocabId);

        const newVocabs = await prisma.topikVocab.findMany({
          where: {
            id: { notIn: reviewedIds },
            ...whereVocab,
          },
          take: 10 - reviews.length,
        });

        return NextResponse.json({
          reviews: reviews.map((r) => ({
            ...r.vocab,
            reviewLog: {
              repetitions: r.repetitions,
              intervalDays: r.intervalDays,
              easeFactor: r.easeFactor,
              incorrectCount: r.incorrectCount,
            },
          })),
          newVocabs,
        });
      }

      return NextResponse.json({
        reviews: reviews.map((r) => ({
          ...r.vocab,
          reviewLog: {
            repetitions: r.repetitions,
            intervalDays: r.intervalDays,
            easeFactor: r.easeFactor,
            incorrectCount: r.incorrectCount,
          },
        })),
        newVocabs: [],
      });
    }

    // Default: return complete vocabulary database with user's status
    const vocabs = await prisma.topikVocab.findMany({
      where: whereVocab,
      include: {
        reviews: {
          where: { userId: session.id },
        },
      },
      orderBy: { level: 'asc' },
    });

    return NextResponse.json({
      vocabs: vocabs.map((v) => ({
        id: v.id,
        korean: v.korean,
        uzbek: v.uzbek,
        hanja: v.hanja,
        pos: v.pos,
        level: v.level,
        exampleKo: v.exampleKo,
        exampleUz: v.exampleUz,
        category: v.category,
        isLearned: v.reviews.length > 0 && v.reviews[0].repetitions > 0,
        repetitions: v.reviews[0]?.repetitions || 0,
      })),
    });
  } catch (error) {
    console.error('TOPIK Vocab error:', error);
    return NextResponse.json({ error: 'Lug‘at ma’lumotlarini olishda xatolik' }, { status: 500 });
  }
}
