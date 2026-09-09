import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../src/lib/auth';

describe('Auth & Cryptography Suite', () => {
  it('correctly hashes and verifies passwords with bcrypt', async () => {
    const raw = 'SuperSecret123!';
    const hashed = await hashPassword(raw);

    expect(hashed).not.toBe(raw);
    expect(hashed.length).toBeGreaterThan(20);

    const match = await verifyPassword(raw, hashed);
    expect(match).toBe(true);

    const wrong = await verifyPassword('WrongPassword', hashed);
    expect(wrong).toBe(false);
  });

  it('signs and verifies JWT session tokens correctly', async () => {
    const payload = {
      userId: 'user-cuid-12345',
      email: 'test@lifeos.local',
      name: 'Azizbek',
    };

    const token = await signToken(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3);

    const verified = await verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.name).toBe(payload.name);
  });

  it('returns null when verifying an invalid or tampered token', async () => {
    const verified = await verifyToken('invalid.token.here');
    expect(verified).toBeNull();
  });
});
