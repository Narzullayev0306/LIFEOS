export interface MissingProfileItem {
  id: string;
  field: string;
  label: string;
  points: number;
  hint: string;
  actionTab: 'profile' | 'appearance' | 'privacy' | 'schedule';
}

export interface ProfileCompletionResult {
  score: number; // 0 - 100
  level: 'Boshlang‘ich' | 'O‘rta' | 'Yaxshi' | 'To‘liq';
  missingItems: MissingProfileItem[];
  completedCount: number;
  totalItemsCount: number;
}

export interface UserProfileDataForCompletion {
  name?: string | null;
  displayName?: string | null;
  username?: string | null;
  avatar?: string | null;
  bio?: string | null;
  occupation?: string | null;
  education?: string | null;
  location?: string | null;
  birthday?: string | null;
  hasTopikGoal?: boolean;
}

const CRITERIA: Array<{
  id: string;
  field: keyof UserProfileDataForCompletion;
  label: string;
  points: number;
  hint: string;
  actionTab: MissingProfileItem['actionTab'];
  check: (data: UserProfileDataForCompletion) => boolean;
}> = [
  {
    id: 'name',
    field: 'name',
    label: 'Ism va familiya',
    points: 15,
    hint: 'To‘liq ism yoki tahallus kiriting',
    actionTab: 'profile',
    check: (d) => Boolean(d.name?.trim() || d.displayName?.trim()),
  },
  {
    id: 'avatar',
    field: 'avatar',
    label: 'Profil rasmi (Avatar)',
    points: 15,
    hint: 'Shaxsiy rasm yuklang yoki tayyor preset tanlang',
    actionTab: 'profile',
    check: (d) => Boolean(d.avatar && d.avatar.length > 5),
  },
  {
    id: 'username',
    field: 'username',
    label: 'Foydalanuvchi nomi (@username)',
    points: 10,
    hint: 'Profil havolangiz uchun noyob username belgilang',
    actionTab: 'profile',
    check: (d) => Boolean(d.username?.trim()),
  },
  {
    id: 'bio',
    field: 'bio',
    label: 'Bio / Qisqacha o‘zingiz haqingizda',
    points: 15,
    hint: 'Shioringiz yoki maqsadlaringiz haqida 1-2 jumla yozing',
    actionTab: 'profile',
    check: (d) => Boolean(d.bio && d.bio.trim().length >= 5),
  },
  {
    id: 'occupation',
    field: 'occupation',
    label: 'Kasb yoki mutaxassislik',
    points: 10,
    hint: 'Faoliyat sohangizni ko‘rsating (masalan, Dasturchi, Talaba)',
    actionTab: 'profile',
    check: (d) => Boolean(d.occupation?.trim()),
  },
  {
    id: 'education',
    field: 'education',
    label: 'Ta’lim muassasasi',
    points: 10,
    hint: 'Universitet yoki maktabingizni kiriting',
    actionTab: 'profile',
    check: (d) => Boolean(d.education?.trim()),
  },
  {
    id: 'location',
    field: 'location',
    label: 'Yashash joyi / Shahar',
    points: 10,
    hint: 'Shahar va mamlakatingizni ko‘rsating',
    actionTab: 'profile',
    check: (d) => Boolean(d.location?.trim()),
  },
  {
    id: 'birthday',
    field: 'birthday',
    label: 'Tug‘ilgan sana',
    points: 5,
    hint: 'Tug‘ilgan kuningizni kiriting',
    actionTab: 'profile',
    check: (d) => Boolean(d.birthday?.trim()),
  },
  {
    id: 'topik',
    field: 'hasTopikGoal',
    label: 'TOPIK II maqsadi',
    points: 10,
    hint: 'Koreys tili bo‘yicha maqsad darajangizni belgilang',
    actionTab: 'schedule',
    check: (d) => Boolean(d.hasTopikGoal),
  },
];

export function calculateProfileCompletion(data: UserProfileDataForCompletion): ProfileCompletionResult {
  let score = 0;
  const missingItems: MissingProfileItem[] = [];
  let completedCount = 0;

  for (const c of CRITERIA) {
    if (c.check(data)) {
      score += c.points;
      completedCount++;
    } else {
      missingItems.push({
        id: c.id,
        field: String(c.field),
        label: c.label,
        points: c.points,
        hint: c.hint,
        actionTab: c.actionTab,
      });
    }
  }

  // Bound score 0..100
  score = Math.min(100, Math.max(0, score));

  let level: ProfileCompletionResult['level'] = 'Boshlang‘ich';
  if (score >= 90) level = 'To‘liq';
  else if (score >= 70) level = 'Yaxshi';
  else if (score >= 40) level = 'O‘rta';

  return {
    score,
    level,
    missingItems,
    completedCount,
    totalItemsCount: CRITERIA.length,
  };
}
