import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';

export type Session = {
  userId: number;
  name: string;
  role: 'admin' | 'user';
};

export const SESSION_COOKIE = 'session';

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not set');
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

export function createSessionToken(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export async function getSession(): Promise<Session | null> {
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
    if (validRole && typeof data.userId === 'number' && typeof data.name === 'string') {
      return data as Session;
    }
  } catch {
    // malformed payload: treat as not signed in
  }
  return null;
}