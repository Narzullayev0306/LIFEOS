import { describe, it, expect, beforeEach } from 'vitest';
import path from 'path';
import fs from 'fs';
import { validateUsername, sanitizeUsername, isReservedUsername } from '../src/lib/usernameValidator';
import { calculateProfileCompletion } from '../src/lib/profileCompletion';
import { parseDashboardWidgets, DEFAULT_DASHBOARD_WIDGETS } from '../src/lib/dashboardWidgets';
import { LocalStorageProvider } from '../src/lib/storage';

describe('Username Validation & Security Suite', () => {
  it('accepts valid usernames', () => {
    expect(validateUsername('azizbek').isValid).toBe(true);
    expect(validateUsername('aziz_bek').isValid).toBe(true);
    expect(validateUsername('aziz.dev').isValid).toBe(true);
    expect(validateUsername('john-doe-99').isValid).toBe(true);
    expect(validateUsername('@alex_lee').isValid).toBe(true); // strips leading @
  });

  it('rejects usernames that are too short or too long', () => {
    expect(validateUsername('ab').isValid).toBe(false);
    expect(validateUsername('a'.repeat(31)).isValid).toBe(false);
  });

  it('rejects usernames starting or ending with special characters', () => {
    expect(validateUsername('_aziz').isValid).toBe(false);
    expect(validateUsername('aziz_').isValid).toBe(false);
    expect(validateUsername('.aziz').isValid).toBe(false);
    expect(validateUsername('aziz.').isValid).toBe(false);
    expect(validateUsername('-aziz').isValid).toBe(false);
  });

  it('rejects usernames with consecutive special characters', () => {
    expect(validateUsername('aziz..dev').isValid).toBe(false);
    expect(validateUsername('aziz__dev').isValid).toBe(false);
    expect(validateUsername('aziz--dev').isValid).toBe(false);
  });

  it('rejects reserved system keywords', () => {
    expect(isReservedUsername('admin')).toBe(true);
    expect(isReservedUsername('API')).toBe(true);
    expect(isReservedUsername('profile')).toBe(true);
    expect(isReservedUsername('settings')).toBe(true);
    expect(validateUsername('admin').isValid).toBe(false);
    expect(validateUsername('root').isValid).toBe(false);
    expect(validateUsername('settings').isValid).toBe(false);
  });

  it('sanitizes input properly', () => {
    expect(sanitizeUsername('@Azizbek_01!')).toBe('azizbek_01');
    expect(sanitizeUsername('  JohnDoe  ')).toBe('johndoe');
  });
});

describe('Profile Completion Calculation Engine', () => {
  it('returns 0 score and all missing items when profile is completely empty', () => {
    const res = calculateProfileCompletion({});
    expect(res.score).toBe(0);
    expect(res.level).toBe('Boshlang‘ich');
    expect(res.completedCount).toBe(0);
    expect(res.missingItems.length).toBe(res.totalItemsCount);
  });

  it('correctly calculates partial scores', () => {
    const res = calculateProfileCompletion({
      name: 'Azizbek',
      displayName: 'Aziz',
      username: 'azizbek',
      bio: 'Software engineer building LIFEOS.',
    });
    // Name (15) + Username (10) + Bio (15) = 40
    expect(res.score).toBe(40);
    expect(res.level).toBe('O‘rta');
    expect(res.completedCount).toBe(3);
  });

  it('returns 100% score and To‘liq level when all profile fields are satisfied', () => {
    const res = calculateProfileCompletion({
      name: 'Azizbek Narzullayev',
      displayName: 'Azizbek',
      username: 'azizbek',
      avatar: '/uploads/avatars/test.png',
      bio: 'Fullstack developer & TOPIK student.',
      occupation: 'Software Engineer',
      education: 'Tashkent University of IT',
      location: 'Tashkent, Uzbekistan',
      birthday: '2001-03-06',
      hasTopikGoal: true,
    });
    expect(res.score).toBe(100);
    expect(res.level).toBe('To‘liq');
    expect(res.missingItems.length).toBe(0);
  });
});

describe('Dashboard Personalization & Widget Ordering', () => {
  it('returns default widgets when no saved preference exists', () => {
    const widgets = parseDashboardWidgets(null);
    expect(widgets.length).toBe(DEFAULT_DASHBOARD_WIDGETS.length);
    expect(widgets[0].id).toBe('tasks');
    expect(widgets[1].id).toBe('topik');
    expect(widgets[2].id).toBe('finance');
  });

  it('reorders and toggles widgets according to saved JSON preferences', () => {
    const customConfig = [
      { id: 'finance', enabled: true, order: 0 },
      { id: 'topik', enabled: false, order: 1 },
      { id: 'tasks', enabled: true, order: 2 },
    ];
    const widgets = parseDashboardWidgets(JSON.stringify(customConfig));

    const finance = widgets.find((w) => w.id === 'finance');
    const topik = widgets.find((w) => w.id === 'topik');
    const tasks = widgets.find((w) => w.id === 'tasks');

    expect(finance?.order).toBe(0);
    expect(finance?.enabled).toBe(true);
    expect(topik?.enabled).toBe(false);
    expect(tasks?.order).toBe(2);

    // Sorted order check
    expect(widgets[0].id).toBe('finance');
  });

  it('falls back to default gracefully when malformed JSON is passed', () => {
    const widgets = parseDashboardWidgets('not-valid-json');
    expect(widgets.length).toBe(DEFAULT_DASHBOARD_WIDGETS.length);
  });
});

describe('Storage Provider Abstraction Suite', () => {
  const testDir = path.join(process.cwd(), 'scratch', 'test-uploads');
  let storage: LocalStorageProvider;

  beforeEach(async () => {
    await fs.promises.mkdir(testDir, { recursive: true });
    storage = new LocalStorageProvider(testDir);
  });

  it('uploads a buffer, saves to disk, and returns relative url', async () => {
    const buffer = Buffer.from('fake-image-bytes');
    const url = await storage.upload({
      buffer,
      mimeType: 'image/png',
      originalFilename: 'avatar.png',
      folder: 'avatars',
    });

    expect(url.startsWith('/uploads/avatars/')).toBe(true);
    expect(url.endsWith('.png')).toBe(true);
  });

  it('replaces an old file with a new file', async () => {
    const buffer1 = Buffer.from('image-1');
    const url1 = await storage.upload({
      buffer: buffer1,
      mimeType: 'image/jpeg',
      folder: 'avatars',
    });

    const buffer2 = Buffer.from('image-2');
    const url2 = await storage.replace(url1, {
      buffer: buffer2,
      mimeType: 'image/png',
      folder: 'avatars',
    });

    expect(url2).not.toBe(url1);
    expect(url2.endsWith('.png')).toBe(true);
  });

  it('prevents path traversal attacks on deletion', async () => {
    // Attempt to delete a file outside allowed directory
    const traversalAttempt = '/uploads/../../package.json';
    const deleted = await storage.delete(traversalAttempt);
    expect(deleted).toBe(false);
  });
});
