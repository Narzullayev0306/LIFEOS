/**
 * Pure, deterministic financial calculations for LIFEOS.
 * Designed with edge-case protection (month boundaries, leap years, zero-division).
 */

export interface DynamicDailyLimitResult {
  monthlyBudget: number;
  spentToDate: number;
  remainingBudget: number;
  totalDaysInMonth: number;
  dayOfMonth: number;
  daysRemaining: number; // includes today
  dailyLimit: number;
  isOverBudget: boolean;
}

export function getDaysInMonth(year: number, month: number): number {
  // month is 0-indexed (0 = Jan, 11 = Dec)
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Calculates the dynamic daily spending limit based on remaining budget and remaining days.
 * Remaining days includes current day.
 */
export function calculateDynamicDailyLimit(
  monthlyBudget: number,
  spentToDate: number,
  targetDate: Date = new Date()
): DynamicDailyLimitResult {
  const budget = Math.max(0, monthlyBudget);
  const spent = Math.max(0, spentToDate);
  const remainingBudget = Math.max(0, budget - spent);
  const isOverBudget = spent > budget;

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const dayOfMonth = targetDate.getDate();
  const totalDaysInMonth = getDaysInMonth(year, month);

  // Remaining days including today: e.g. on March 15 in a 31-day month, 31 - 15 + 1 = 17 days
  const daysRemaining = Math.max(1, totalDaysInMonth - dayOfMonth + 1);

  let dailyLimit = 0;
  if (!isOverBudget && remainingBudget > 0) {
    dailyLimit = Math.round((remainingBudget / daysRemaining) * 100) / 100;
  }

  return {
    monthlyBudget: budget,
    spentToDate: spent,
    remainingBudget,
    totalDaysInMonth,
    dayOfMonth,
    daysRemaining,
    dailyLimit,
    isOverBudget,
  };
}

export interface IncomeProgressResult {
  targetMonthlyIncome: number;
  actualIncome: number;
  remainingTarget: number;
  percentAchieved: number;
  requiredDailyIncome: number;
}

/**
 * Calculates income progress towards monthly earnings goal.
 */
export function calculateIncomeProgress(
  targetMonthlyIncome: number,
  actualIncome: number,
  targetDate: Date = new Date()
): IncomeProgressResult {
  const target = Math.max(0, targetMonthlyIncome);
  const actual = Math.max(0, actualIncome);
  const remainingTarget = Math.max(0, target - actual);

  const percentAchieved =
    target > 0 ? Math.min(100, Math.round((actual / target) * 100 * 10) / 10) : 100;

  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const dayOfMonth = targetDate.getDate();
  const totalDaysInMonth = getDaysInMonth(year, month);
  const daysRemaining = Math.max(1, totalDaysInMonth - dayOfMonth + 1);

  const requiredDailyIncome =
    remainingTarget > 0 ? Math.round((remainingTarget / daysRemaining) * 100) / 100 : 0;

  return {
    targetMonthlyIncome: target,
    actualIncome: actual,
    remainingTarget,
    percentAchieved,
    requiredDailyIncome,
  };
}
