import { describe, it, expect } from 'vitest';
import {
  doIntervalsOverlap,
  detectScheduleConflicts,
  checkSleepConflict,
  parseTimeToMinutes,
  formatMinutesToTime,
} from '../src/lib/calculations/planner';

describe('Advanced Planner & Schedule Calculations', () => {
  it('correctly handles boundary minute intervals without false positive overlap', () => {
    // Back to back: 10:00 - 11:00 and 11:00 - 12:00 should NOT overlap
    const backToBack = doIntervalsOverlap('10:00', '11:00', '11:00', '12:00');
    expect(backToBack.overlaps).toBe(false);
    expect(backToBack.overlapMinutes).toBe(0);

    // 1 minute overlap: 10:00 - 11:01 and 11:00 - 12:00
    const oneMinOverlap = doIntervalsOverlap('10:00', '11:01', '11:00', '12:00');
    expect(oneMinOverlap.overlaps).toBe(true);
    expect(oneMinOverlap.overlapMinutes).toBe(1);
  });

  it('detects multiple pairwise conflicts in dense schedules', () => {
    const slots = [
      { id: '1', title: 'Task 1', startTime: '09:00', endTime: '11:00' },
      { id: '2', title: 'Task 2', startTime: '10:00', endTime: '12:00' },
      { id: '3', title: 'Task 3', startTime: '10:30', endTime: '11:30' },
    ];
    const conflicts = detectScheduleConflicts(slots);
    // (1, 2), (1, 3), (2, 3) -> 3 conflicts
    expect(conflicts.length).toBe(3);
  });

  it('correctly formats and normalizes 24-hour wrap-around times', () => {
    expect(formatMinutesToTime(1440)).toBe('00:00');
    expect(formatMinutesToTime(1470)).toBe('00:30');
    expect(formatMinutesToTime(-30)).toBe('23:30');
  });

  it('validates sleep conflict spanning across midnight', () => {
    // Sleep: 22:30 to 07:00
    const lateNightTask = checkSleepConflict('23:00', '23:45', '22:30', '07:00');
    expect(lateNightTask.conflicts).toBe(true);

    const earlyMorningTask = checkSleepConflict('06:00', '06:45', '22:30', '07:00');
    expect(earlyMorningTask.conflicts).toBe(true);

    const safeDayTask = checkSleepConflict('09:00', '12:00', '22:30', '07:00');
    expect(safeDayTask.conflicts).toBe(false);
  });
});
