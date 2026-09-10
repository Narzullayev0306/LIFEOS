export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'api',
  'auth',
  'dashboard',
  'finance',
  'goals',
  'habits',
  'help',
  'home',
  'login',
  'logout',
  'null',
  'onboarding',
  'planner',
  'privacy',
  'profile',
  'register',
  'root',
  'settings',
  'support',
  'system',
  'terms',
  'topik',
  'undefined',
  'user',
  'users',
]);

export interface UsernameValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(username.toLowerCase().trim());
}

export function sanitizeUsername(raw: string): string {
  if (!raw) return '';
  return raw
    .trim()
    .toLowerCase()
    .replace(/^@+/, '') // Remove leading @ if typed
    .replace(/[^a-z0-9_.-]/g, '');
}

export function validateUsername(raw: string): UsernameValidationResult {
  if (!raw || typeof raw !== 'string') {
    return { isValid: false, error: 'Username kiritilishi shart' };
  }

  const cleaned = raw.trim().toLowerCase().replace(/^@+/, '');

  if (cleaned.length < 3) {
    return { isValid: false, error: 'Username kamida 3 ta belgidan iborat bo‘lishi kerak' };
  }

  if (cleaned.length > 30) {
    return { isValid: false, error: 'Username 30 ta belgidan oshmasligi kerak' };
  }

  const validRegex = /^[a-z0-9][a-z0-9_.-]*[a-z0-9]$/;
  if (!validRegex.test(cleaned)) {
    return {
      isValid: false,
      error: 'Username faqat harflar, raqamlar, tire, pastki chiziq yoki nuqtadan iborat bo‘lishi va harf/raqam bilan boshlanishi hamda tugashi kerak',
    };
  }

  if (/[-_.]{2,}/.test(cleaned)) {
    return {
      isValid: false,
      error: 'Username ketma-ket maxsus belgilarni o‘z ichiga ololmaydi',
    };
  }

  if (isReservedUsername(cleaned)) {
    return {
      isValid: false,
      error: `"${cleaned}" tizim tomonidan band qilingan username. Boshqa nom tanlang`,
    };
  }

  return { isValid: true, sanitized: cleaned };
}
