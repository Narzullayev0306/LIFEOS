/**
 * TOPIK Spaced Repetition (SM-2 Algorithm) & Level Evaluation calculations.
 */

export interface SM2Input {
  repetitions: number; // consecutive correct reviews
  intervalDays: number;
  easeFactor: number;
  quality: number; // 0 to 5 (0: complete blackout, 3: pass with difficulty, 5: perfect)
}

export interface SM2Output {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
  nextReviewDate: Date;
  isCorrect: boolean;
}

/**
 * Calculates next review interval using standard SM-2 algorithm.
 */
export function calculateSM2(input: SM2Input, currentDate: Date = new Date()): SM2Output {
  const quality = Math.max(0, Math.min(5, Math.round(input.quality)));
  let { repetitions, intervalDays, easeFactor } = input;

  // Quality >= 3 is considered a successful recall
  const isCorrect = quality >= 3;

  if (isCorrect) {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  } else {
    // Failed recall: reset repetitions back to 0, review tomorrow
    repetitions = 0;
    intervalDays = 1;
  }

  // Adjust ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  // Keep EF within reasonable bounds (minimum 1.3)
  easeFactor = Math.max(1.3, Math.round(easeFactor * 100) / 100);

  const nextReviewDate = new Date(currentDate);
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return {
    repetitions,
    intervalDays,
    easeFactor,
    nextReviewDate,
    isCorrect,
  };
}

/**
 * Determines TOPIK achieved level based on official scoring criteria.
 * TOPIK I (Max 200):
 *   Level 1: 80 - 139
 *   Level 2: 140 - 200
 * TOPIK II (Max 300):
 *   Level 3: 120 - 149
 *   Level 4: 150 - 189
 *   Level 5: 190 - 229
 *   Level 6: 230 - 300
 */
export function determineTopikLevel(
  examType: 'TOPIK_I' | 'TOPIK_II',
  score: number
): { level: number; passed: boolean; nextLevelThreshold: number | null } {
  const clampedScore = Math.max(0, Math.round(score));

  if (examType === 'TOPIK_I') {
    if (clampedScore >= 140) return { level: 2, passed: true, nextLevelThreshold: null };
    if (clampedScore >= 80) return { level: 1, passed: true, nextLevelThreshold: 140 };
    return { level: 0, passed: false, nextLevelThreshold: 80 };
  } else {
    if (clampedScore >= 230) return { level: 6, passed: true, nextLevelThreshold: null };
    if (clampedScore >= 190) return { level: 5, passed: true, nextLevelThreshold: 230 };
    if (clampedScore >= 150) return { level: 4, passed: true, nextLevelThreshold: 190 };
    if (clampedScore >= 120) return { level: 3, passed: true, nextLevelThreshold: 150 };
    return { level: 0, passed: false, nextLevelThreshold: 120 };
  }
}
