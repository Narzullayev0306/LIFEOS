/**
 * Pure, deterministic Discipline Score calculation engine for LIFEOS.
 * Explains exactly how the score was derived from real user activity.
 */

export interface DisciplineFactors {
  tasksTotal: number;
  tasksCompleted: number;
  habitsTotal: number;
  habitsCompleted: number;
  studyMinutesTarget: number;
  studyMinutesActual: number;
  dailySpendLimit: number;
  dailySpendActual: number;
}

export interface DisciplineScoreBreakdown {
  totalScore: number; // 0 to 100
  tasksScore: number; // 0 to 35
  habitsScore: number; // 0 to 30
  studyScore: number; // 0 to 25
  financeScore: number; // 0 to 10
  explanation: string;
  components: {
    tasks: { weight: number; actualPercent: number; points: number };
    habits: { weight: number; actualPercent: number; points: number };
    study: { weight: number; actualPercent: number; points: number };
    finance: { weight: number; actualPercent: number; points: number };
  };
}

export function calculateDisciplineScore(factors: DisciplineFactors): DisciplineScoreBreakdown {
  // 1. Tasks Component (Weight: 35 points)
  let tasksPercent = 100;
  if (factors.tasksTotal > 0) {
    tasksPercent = Math.min(100, (factors.tasksCompleted / factors.tasksTotal) * 100);
  }
  const tasksPoints = Math.round((tasksPercent / 100) * 35 * 10) / 10;

  // 2. Habits Component (Weight: 30 points)
  let habitsPercent = 100;
  if (factors.habitsTotal > 0) {
    habitsPercent = Math.min(100, (factors.habitsCompleted / factors.habitsTotal) * 100);
  }
  const habitsPoints = Math.round((habitsPercent / 100) * 30 * 10) / 10;

  // 3. Study Component (Weight: 25 points)
  let studyPercent = 100;
  if (factors.studyMinutesTarget > 0) {
    studyPercent = Math.min(100, (factors.studyMinutesActual / factors.studyMinutesTarget) * 100);
  }
  const studyPoints = Math.round((studyPercent / 100) * 25 * 10) / 10;

  // 4. Finance Component (Weight: 10 points)
  let financePercent = 100;
  if (factors.dailySpendLimit > 0) {
    if (factors.dailySpendActual <= factors.dailySpendLimit) {
      financePercent = 100;
    } else {
      // Penalty proportional to overspending, capped at 0
      const excess = factors.dailySpendActual - factors.dailySpendLimit;
      const overspendRatio = excess / factors.dailySpendLimit;
      financePercent = Math.max(0, 100 - overspendRatio * 100);
    }
  }
  const financePoints = Math.round((financePercent / 100) * 10 * 10) / 10;

  const totalScore = Math.min(100, Math.max(0, Math.round(tasksPoints + habitsPoints + studyPoints + financePoints)));

  let rating = 'Excellent';
  if (totalScore < 50) rating = 'Needs Focus';
  else if (totalScore < 70) rating = 'Developing';
  else if (totalScore < 85) rating = 'Solid';

  const explanation = `${rating} (${totalScore}/100): Tasks ${tasksPoints}/35 (${Math.round(tasksPercent)}%), Habits ${habitsPoints}/30 (${Math.round(habitsPercent)}%), Study ${studyPoints}/25 (${Math.round(studyPercent)}%), Finance ${financePoints}/10 (${Math.round(financePercent)}%).`;

  return {
    totalScore,
    tasksScore: tasksPoints,
    habitsScore: habitsPoints,
    studyScore: studyPoints,
    financeScore: financePoints,
    explanation,
    components: {
      tasks: { weight: 35, actualPercent: Math.round(tasksPercent), points: tasksPoints },
      habits: { weight: 30, actualPercent: Math.round(habitsPercent), points: habitsPoints },
      study: { weight: 25, actualPercent: Math.round(studyPercent), points: studyPoints },
      finance: { weight: 10, actualPercent: Math.round(financePercent), points: financePoints },
    },
  };
}
