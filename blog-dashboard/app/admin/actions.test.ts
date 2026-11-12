import { vi, test, expect, beforeEach } from 'vitest';

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/data', () => ({ addPost: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { createPost } from './actions';
import { getSession } from '@/lib/session';
import { addPost } from '@/lib/data';
import { revalidatePath } from 'next/cache';

function formWith(title: string, content: string) {
  const fd = new FormData();
  fd.set('title', title);
  fd.set('content', content);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
});

test('rejects non-admin callers and never writes', async () => {
  vi.mocked(getSession).mockResolvedValue({ userId: 2, name: 'Alisha Lawaju', role: 'user' });

  expect(await createPost(formWith('x', 'y'))).toEqual({ error: 'Not authorized' });
  expect(addPost).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});

test('rejects callers with no session and never writes', async () => {
  vi.mocked(getSession).mockResolvedValue(null);

  expect(await createPost(formWith('x', 'y'))).toEqual({ error: 'Not authorized' });
  expect(addPost).not.toHaveBeenCalled();
});

test('checks authorization before validation', async () => {
  vi.mocked(getSession).mockResolvedValue({ userId: 2, name: 'Alisha Lawaju', role: 'user' });

  // Invalid input from a non-admin must still say "Not authorized", not "Invalid input"
  expect(await createPost(formWith('', ''))).toEqual({ error: 'Not authorized' });
  expect(addPost).not.toHaveBeenCalled();
});

test('rejects invalid input from an admin and never writes', async () => {
  vi.mocked(getSession).mockResolvedValue({ userId: 1, name: 'Umesh Suwal', role: 'admin' });

  expect(await createPost(formWith('', 'some content'))).toEqual({ error: 'Invalid input' });
  expect(await createPost(formWith('a title', ''))).toEqual({ error: 'Invalid input' });
  expect(await createPost(formWith('t'.repeat(121), 'some content'))).toEqual({ error: 'Invalid input' });
  expect(addPost).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
});

test('writes and revalidates for a valid admin request', async () => {
  vi.mocked(getSession).mockResolvedValue({ userId: 1, name: 'Umesh Suwal', role: 'admin' });

  expect(await createPost(formWith('Hello', 'World'))).toEqual({ ok: true });
  expect(addPost).toHaveBeenCalledWith({ title: 'Hello', content: 'World', author: 'Umesh Suwal' });
  expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
});