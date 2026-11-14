import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';

export type Session = {
  userId: number;
  name: string;
  role: 'admin' | 'user';
};

export const SESSION_COOKIE = 'session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createSessionToken(session: Session): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = Buffer.from(JSON.stringify({ ...session, exp })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export async function getSession(): Promise<Session | null> {
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    const validRole = data.role === 'admin' || data.role === 'user';
    const notExpired = typeof data.exp === 'number' && data.exp > Date.now() / 1000;
    if (validRole && notExpired && typeof data.userId === 'number' && typeof data.name === 'string') {
      return { userId: data.userId, name: data.name, role: data.role };
    }
  } catch {
    // malformed payload: treat as not signed in
  }
  return null;
}

export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== 'admin') redirect('/login');
  return session;
}