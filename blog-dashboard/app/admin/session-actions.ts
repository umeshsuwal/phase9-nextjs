'use server';

import { cookies } from 'next/headers';
import { SESSION_COOKIE, createSessionToken } from '@/lib/session';

async function signInAs(session: Parameters<typeof createSessionToken>[0]) {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(session), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
}

export async function signInAsAdmin() {
  await signInAs({ userId: 1, name: 'Umesh Suwal', role: 'admin' });
}

export async function signInAsUser() {
  await signInAs({ userId: 2, name: 'Nishal Manandhar', role: 'user' });
}

export async function signOut() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}