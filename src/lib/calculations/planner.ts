/**
 * Pure schedule conflict detection, sleep protection, and timeline slot allocation.
 */

export interface TimeSlot {
  id: string;
  title: string;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  isFixed?: boolean;
}

export interface ConflictItem {
  slotA: TimeSlot;
  slotB: TimeSlot;
  overlapMinutes: number;
}

export function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function formatMinutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Checks if two time intervals overlap.
 */
export function doIntervalsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): { overlaps: boolean; overlapMinutes: number } {
  const minStartA = parseTimeToMinutes(startA);
  const minEndA = parseTimeToMinutes(endA);
  const minStartB = parseTimeToMinutes(startB);
  const minEndB = parseTimeToMinutes(endB);

  const overlapStart = Math.max(minStartA, minStartB);
  const overlapEnd = Math.min(minEndA, minEndB);

  if (overlapStart < overlapEnd) {
    return { overlaps: true, overlapMinutes: overlapEnd - overlapStart };
  }
  return { overlaps: false, overlapMinutes: 0 };
}

/**
 * Detects all conflicts within a list of time slots.
 */
export function detectScheduleConflicts(slots: TimeSlot[]): ConflictItem[] {
  const conflicts: ConflictItem[] = [];

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const a = slots[i];
      const b = slots[j];
      const check = doIntervalsOverlap(a.startTime, a.endTime, b.startTime, b.endTime);
      if (check.overlaps) {
        conflicts.push({
          slotA: a,
          slotB: b,
          overlapMinutes: check.overlapMinutes,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Checks if a scheduled task infringes upon the user's protected sleep window.
 * Default sleep window: sleepTime (e.g. 23:00) to wakeTime (e.g. 06:30 next morning).
 */
export function checkSleepConflict(
  taskStartTime: string,
  taskEndTime: string,
  sleepTime: string = '23:00',
  wakeTime: string = '06:30'
): { conflicts: boolean; message: string | null } {
  const taskStart = parseTimeToMinutes(taskStartTime);
  const taskEnd = parseTimeToMinutes(taskEndTime);
  const sleepStart = parseTimeToMinutes(sleepTime);
  const wakeEnd = parseTimeToMinutes(wakeTime);

  // Sleep spans across midnight if sleepStart > wakeEnd (e.g. 23:00 -> 06:30)
  const isNightSleep = sleepStart > wakeEnd;

  let conflicts = false;
  if (isNightSleep) {
    // Task conflicts if it ends after sleepStart (e.g. past 23:00) OR starts before wakeEnd (e.g. before 06:30)
    if (taskStart < wakeEnd || taskEnd > sleepStart || (taskStart >= sleepStart) || (taskEnd <= wakeEnd && taskStart < taskEnd)) {
      conflicts = true;
    }
  } else {
    // Regular daytime sleep window
    const check = doIntervalsOverlap(taskStartTime, taskEndTime, sleepTime, wakeTime);
    conflicts = check.overlaps;
  }

  if (conflicts) {
    return {
      conflicts: true,
      message: `Task overlaps with protected sleep period (${sleepTime} – ${wakeTime}). Protect sleep for optimal discipline.`,
    };
  }

  return { conflicts: false, message: null };
}
