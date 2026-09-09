import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Tizimdan muvaffaqiyatli chiqildi.' });
  response.cookies.delete(AUTH_COOKIE_NAME);
  return response;
}
