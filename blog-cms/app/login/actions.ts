'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyPassword } from '@/lib/password';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from '@/lib/session';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(formData: FormData) {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!parsed.success || !adminEmail || !passwordHash) redirect('/login?error=1');

  const emailOk = parsed.data.email.toLowerCase() === adminEmail.toLowerCase();
  const passwordOk = verifyPassword(parsed.data.password, passwordHash);
  if (!emailOk || !passwordOk) redirect('/login?error=1');

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken({ userId: 1, name: 'Admin', role: 'admin' }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect('/admin');
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/login');
}