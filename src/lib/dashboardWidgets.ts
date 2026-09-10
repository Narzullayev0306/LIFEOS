export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  order: number;
}

export const DEFAULT_DASHBOARD_WIDGETS: WidgetConfig[] = [
  {
    id: 'tasks',
    name: 'Hozirgi va Keyingi Vazifalar',
    description: 'Faol vazifa pomodoro fokus taymeri va keyingi navbatdagi reja',
    enabled: true,
    order: 0,
  },
  {
    id: 'topik',
    name: 'TOPIK II Tayyorgarlik',
    description: 'Imtihon taymeri, bugungi SM-2 takrori va dars progressi',
    enabled: true,
    order: 1,
  },
  {
    id: 'finance',
    name: 'Moliyaviy Nazorat & Dinamik Limit',
    description: 'Bugungi xarajatlar, oylik qolgan byudjet va kunlik sarflash normasi',
    enabled: true,
    order: 2,
  },
  {
    id: 'habits',
    name: 'Kunlik Odatlar & Streak',
    description: 'Odatlar ro‘yxati, tezkor bajarish va uzluksiz seriya ko‘rsatkichi',
    enabled: true,
    order: 3,
  },
  {
    id: 'goals',
    name: 'Asosiy Maqsadlar & Bosqichlar',
    description: 'Muhim maqsadlar rivoji va yakunlangan bosqichlar',
    enabled: true,
    order: 4,
  },
];

export function parseDashboardWidgets(jsonStr?: string | null): WidgetConfig[] {
  if (!jsonStr || jsonStr.trim() === '' || jsonStr.trim() === '[]') {
    return [...DEFAULT_DASHBOARD_WIDGETS];
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...DEFAULT_DASHBOARD_WIDGETS];
    }

    // Merge with defaults in case new widgets are added in the future
    const map = new Map<string, any>(parsed.map((item: any) => [item.id, item]));

    const result: WidgetConfig[] = DEFAULT_DASHBOARD_WIDGETS.map((def, idx) => {
      const existing = map.get(def.id);
      if (existing) {
        return {
          id: def.id,
          name: def.name,
          description: def.description,
          enabled: typeof existing.enabled === 'boolean' ? existing.enabled : def.enabled,
          order: typeof existing.order === 'number' ? existing.order : idx,
        };
      }
      return def;
    });

    // Sort by order ascending
    result.sort((a, b) => a.order - b.order);
    return result;
  } catch {
    return [...DEFAULT_DASHBOARD_WIDGETS];
  }
}
