import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { calculateSM2 } from '@/lib/calculations/topik';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o‘tilmagan' }, { status: 401 });
    }

    const { vocabId, quality } = await req.json();

    if (!vocabId || quality === undefined) {
      return NextResponse.json({ error: 'vocabId va quality qiymatlari talab qilinadi' }, { status: 400 });
    }

    const existingLog = await prisma.vocabReviewLog.findUnique({
      where: {
        userId_vocabId: {
          userId: session.id,
          vocabId,
        },
      },
    });

    const currentRepetitions = existingLog?.repetitions || 0;
    const currentInterval = existingLog?.intervalDays || 1;
    const currentEase = existingLog?.easeFactor || 2.5;
    let incorrectCount = existingLog?.incorrectCount || 0;

    const sm2Result = calculateSM2({
      repetitions: currentRepetitions,
      intervalDays: currentInterval,
      easeFactor: currentEase,
      quality: Number(quality),
    });

    if (!sm2Result.isCorrect) {
      incorrectCount += 1;
    }

    const updatedLog = await prisma.vocabReviewLog.upsert({
      where: {
        userId_vocabId: {
          userId: session.id,
          vocabId,
        },
      },
      update: {
        repetitions: sm2Result.repetitions,
        intervalDays: sm2Result.intervalDays,
        easeFactor: sm2Result.easeFactor,
        nextReviewDate: sm2Result.nextReviewDate,
        lastQuality: Number(quality),
        incorrectCount,
      },
      create: {
        userId: session.id,
        vocabId,
        repetitions: sm2Result.repetitions,
        intervalDays: sm2Result.intervalDays,
        easeFactor: sm2Result.easeFactor,
        nextReviewDate: sm2Result.nextReviewDate,
        lastQuality: Number(quality),
        incorrectCount,
      },
    });

    return NextResponse.json({
      success: true,
      result: sm2Result,
      reviewLog: updatedLog,
    });
  } catch (error) {
    console.error('TOPIK Review error:', error);
    return NextResponse.json({ error: 'Takrorlash natijasini saqlashda xatolik' }, { status: 500 });
  }
}
