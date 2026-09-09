import { describe, it, expect } from 'vitest';
import {
  calculateDynamicDailyLimit,
  calculateIncomeProgress,
  getDaysInMonth,
} from '../src/lib/calculations/finance';
import { calculateDisciplineScore } from '../src/lib/calculations/discipline';
import { calculateSM2, determineTopikLevel } from '../src/lib/calculations/topik';
import {
  doIntervalsOverlap,
  detectScheduleConflicts,
  checkSleepConflict,
  parseTimeToMinutes,
  formatMinutesToTime,
} from '../src/lib/calculations/planner';

describe('Finance Calculations', () => {
  it('correctly calculates days in month including leap years', () => {
    expect(getDaysInMonth(2024, 1)).toBe(29); // Feb 2024 (Leap year)
    expect(getDaysInMonth(2025, 1)).toBe(28); // Feb 2025 (Standard year)
    expect(getDaysInMonth(2026, 2)).toBe(31); // March 2026
    expect(getDaysInMonth(2026, 3)).toBe(30); // April 2026
  });

  it('calculates dynamic daily limit under standard conditions', () => {
    // March 15 in 31-day month: 17 days remaining (15th to 31st)
    const testDate = new Date(2026, 2, 15);
    const result = calculateDynamicDailyLimit(3400000, 1700000, testDate);

    expect(result.daysRemaining).toBe(17);
    expect(result.remainingBudget).toBe(1700000);
    // 1,700,000 / 17 = 100,000
    expect(result.dailyLimit).toBe(100000);
    expect(result.isOverBudget).toBe(false);
  });

  it('handles edge case when budget is exceeded', () => {
    const testDate = new Date(2026, 2, 20);
    const result = calculateDynamicDailyLimit(2000000, 2500000, testDate);
    expect(result.isOverBudget).toBe(true);
    expect(result.remainingBudget).toBe(0);
    expect(result.dailyLimit).toBe(0);
  });

  it('calculates income progress and daily earning requirements', () => {
    const testDate = new Date(2026, 2, 1);
    const result = calculateIncomeProgress(10000000, 2000000, testDate);
    expect(result.remainingTarget).toBe(8000000);
    expect(result.percentAchieved).toBe(20);
    expect(result.requiredDailyIncome).toBe(Math.round((8000000 / 31) * 100) / 100);
  });
});

describe('Discipline Score Engine', () => {
  it('calculates perfect 100 discipline score', () => {
    const result = calculateDisciplineScore({
      tasksTotal: 5,
      tasksCompleted: 5,
      habitsTotal: 4,
      habitsCompleted: 4,
      studyMinutesTarget: 90,
      studyMinutesActual: 90,
      dailySpendLimit: 100000,
      dailySpendActual: 80000,
    });

    expect(result.totalScore).toBe(100);
    expect(result.tasksScore).toBe(35);
    expect(result.habitsScore).toBe(30);
    expect(result.studyScore).toBe(25);
    expect(result.financeScore).toBe(10);
  });

  it('calculates partial score with zero division safety', () => {
    const result = calculateDisciplineScore({
      tasksTotal: 0,
      tasksCompleted: 0,
      habitsTotal: 0,
      habitsCompleted: 0,
      studyMinutesTarget: 0,
      studyMinutesActual: 0,
      dailySpendLimit: 0,
      dailySpendActual: 0,
    });

    expect(result.totalScore).toBe(100);
    expect(typeof result.explanation).toBe('string');
  });

  it('penalizes overspending appropriately', () => {
    const result = calculateDisciplineScore({
      tasksTotal: 5,
      tasksCompleted: 5,
      habitsTotal: 4,
      habitsCompleted: 4,
      studyMinutesTarget: 90,
      studyMinutesActual: 90,
      dailySpendLimit: 100000,
      dailySpendActual: 200000, // 100% overspend -> 0 finance points
    });

    expect(result.financeScore).toBe(0);
    expect(result.totalScore).toBe(90);
  });
});

describe('TOPIK SM-2 & Scoring Engine', () => {
  it('progresses intervals correctly on successful reviews', () => {
    const now = new Date(2026, 2, 1);

    // Review 1 (perfect quality 5)
    const review1 = calculateSM2(
      { repetitions: 0, intervalDays: 1, easeFactor: 2.5, quality: 5 },
      now
    );
    expect(review1.repetitions).toBe(1);
    expect(review1.intervalDays).toBe(1);

    // Review 2
    const review2 = calculateSM2(
      { repetitions: review1.repetitions, intervalDays: review1.intervalDays, easeFactor: review1.easeFactor, quality: 5 },
      now
    );
    expect(review2.repetitions).toBe(2);
    expect(review2.intervalDays).toBe(6);

    // Review 3 (interval = 6 * 2.6 = 16)
    const review3 = calculateSM2(
      { repetitions: review2.repetitions, intervalDays: review2.intervalDays, easeFactor: review2.easeFactor, quality: 5 },
      now
    );
    expect(review3.repetitions).toBe(3);
    expect(review3.intervalDays).toBeGreaterThan(6);
  });

  it('resets repetitions to 0 on failure (quality < 3)', () => {
    const review = calculateSM2(
      { repetitions: 5, intervalDays: 30, easeFactor: 2.5, quality: 1 }
    );
    expect(review.repetitions).toBe(0);
    expect(review.intervalDays).toBe(1);
    expect(review.isCorrect).toBe(false);
  });

  it('correctly maps TOPIK II levels', () => {
    expect(determineTopikLevel('TOPIK_II', 240).level).toBe(6);
    expect(determineTopikLevel('TOPIK_II', 200).level).toBe(5);
    expect(determineTopikLevel('TOPIK_II', 160).level).toBe(4);
    expect(determineTopikLevel('TOPIK_II', 130).level).toBe(3);
    expect(determineTopikLevel('TOPIK_II', 100).level).toBe(0);
  });
});

describe('Planner Conflict & Sleep Protection', () => {
  it('converts time strings to minutes accurately', () => {
    expect(parseTimeToMinutes('00:00')).toBe(0);
    expect(parseTimeToMinutes('06:30')).toBe(390);
    expect(parseTimeToMinutes('23:00')).toBe(1380);
    expect(formatMinutesToTime(390)).toBe('06:30');
  });

  it('detects interval overlaps', () => {
    const overlap = doIntervalsOverlap('09:00', '10:30', '10:00', '11:00');
    expect(overlap.overlaps).toBe(true);
    expect(overlap.overlapMinutes).toBe(30);

    const noOverlap = doIntervalsOverlap('09:00', '10:00', '10:00', '11:00');
    expect(noOverlap.overlaps).toBe(false);
  });

  it('detects multi-slot schedule conflicts', () => {
    const slots = [
      { id: '1', title: 'Task 1', startTime: '09:00', endTime: '10:30' },
      { id: '2', title: 'Task 2', startTime: '10:00', endTime: '11:30' },
      { id: '3', title: 'Task 3', startTime: '13:00', endTime: '14:00' },
    ];
    const conflicts = detectScheduleConflicts(slots);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].slotA.id).toBe('1');
    expect(conflicts[0].slotB.id).toBe('2');
  });

  it('warns when a task encroaches on protected sleep', () => {
    // Sleep window: 23:00 to 06:30
    const lateTask = checkSleepConflict('23:30', '00:30', '23:00', '06:30');
    expect(lateTask.conflicts).toBe(true);

    const earlyTask = checkSleepConflict('05:00', '06:00', '23:00', '06:30');
    expect(earlyTask.conflicts).toBe(true);

    const daytimeTask = checkSleepConflict('14:00', '15:00', '23:00', '06:30');
    expect(daytimeTask.conflicts).toBe(false);
  });
});
