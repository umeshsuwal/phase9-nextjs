import { vi, test, expect, beforeEach } from 'vitest';

vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/posts', async () => {
  // Keep the real slugify and DuplicateSlugError, fake only the storage functions
  const actual = await vi.importActual<typeof import('@/lib/posts')>('@/lib/posts');
  return {
    ...actual,
    createPostRecord: vi.fn(),
    updatePostRecord: vi.fn(),
    deletePostRecord: vi.fn(),
    getPostById: vi.fn(),
  };
});

import { createPost, updatePost, deletePost } from './actions';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  DuplicateSlugError,
  createPostRecord,
  updatePostRecord,
  deletePostRecord,
  getPostById,
} from '@/lib/posts';

const admin = { userId: 1, name: 'Admin', role: 'admin' as const };
const nonAdmin = { userId: 2, name: 'Alisha Lawaju', role: 'user' as const };
const existingPost = {
  id: 7,
  slug: 'existing-post',
  title: 'Existing post',
  content: 'Some content',
  author: 'Admin',
  createdAt: '2026-10-01T09:00:00.000Z',
  updatedAt: '2026-10-01T09:00:00.000Z',
};

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

function expectNothingWritten() {
  expect(createPostRecord).not.toHaveBeenCalled();
  expect(updatePostRecord).not.toHaveBeenCalled();
  expect(deletePostRecord).not.toHaveBeenCalled();
  expect(revalidatePath).not.toHaveBeenCalled();
  expect(redirect).not.toHaveBeenCalled();
}

const actions = [
  ['createPost', createPost, { title: 'A title', content: 'Some content' }],
  ['updatePost', updatePost, { id: '7', title: 'A title', content: 'Some content' }],
  ['deletePost', deletePost, { id: '7' }],
] as const;

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getPostById).mockResolvedValue(existingPost);
});

// Unauthorized callers 

test.each(actions)('%s rejects a non-admin caller and never writes', async (_name, action, fields) => {
  vi.mocked(getSession).mockResolvedValue(nonAdmin);

  expect(await action(form(fields))).toEqual({ error: 'Not authorized' });
  expectNothingWritten();
});

test.each(actions)('%s rejects a caller with no session and never writes', async (_name, action, fields) => {
  vi.mocked(getSession).mockResolvedValue(null);

  expect(await action(form(fields))).toEqual({ error: 'Not authorized' });
  expectNothingWritten();
});

test.each(actions)('%s checks authorization before validation', async (_name, action) => {
  vi.mocked(getSession).mockResolvedValue(nonAdmin);

  // Invalid input from a non-admin must still be "Not authorized"
  expect(await action(form({}))).toEqual({ error: 'Not authorized' });
  expectNothingWritten();
});

// Invalid input from an admin 

test('createPost rejects invalid input and never writes', async () => {
  vi.mocked(getSession).mockResolvedValue(admin);

  expect(await createPost(form({ title: '', content: 'x' }))).toEqual({ error: 'Invalid input' });
  expect(await createPost(form({ title: 'x', content: '' }))).toEqual({ error: 'Invalid input' });
  expect(await createPost(form({ title: 't'.repeat(121), content: 'x' }))).toEqual({ error: 'Invalid input' });
  expect(await createPost(form({ title: '!!!', content: 'x' }))).toEqual({
    error: 'The title must contain letters or numbers',
  });
  expectNothingWritten();
});

test('updatePost rejects invalid input and never writes', async () => {
  vi.mocked(getSession).mockResolvedValue(admin);

  expect(await updatePost(form({ id: 'abc', title: 'x', content: 'x' }))).toEqual({ error: 'Invalid input' });
  expect(await updatePost(form({ id: '7', title: '', content: 'x' }))).toEqual({ error: 'Invalid input' });
  expect(await updatePost(form({ id: '7', title: 'x', content: '' }))).toEqual({ error: 'Invalid input' });
  expectNothingWritten();
});

test('deletePost rejects an invalid id and never writes', async () => {
  vi.mocked(getSession).mockResolvedValue(admin);

  expect(await deletePost(form({ id: '-1' }))).toEqual({ error: 'Invalid input' });
  expect(await deletePost(form({ id: 'abc' }))).toEqual({ error: 'Invalid input' });
  expectNothingWritten();
});

// Other failure cases 

test('createPost returns a clear error for a duplicate slug', async () => {
  vi.mocked(getSession).mockResolvedValue(admin);
  vi.mocked(createPostRecord).mockRejectedValue(new DuplicateSlugError('a-title'));

  expect(await createPost(form({ title: 'A title', content: 'Some content' }))).toEqual({
    error: 'A post with this title already exists. Choose a different title.',
  });
  expect(redirect).not.toHaveBeenCalled();
});

test('updatePost and deletePost report a post that does not exist', async () => {
  vi.mocked(getSession).mockResolvedValue(admin);
  vi.mocked(getPostById).mockResolvedValue(null);

  expect(await updatePost(form({ id: '99', title: 'x', content: 'x' }))).toEqual({ error: 'Post not found' });
  expect(await deletePost(form({ id: '99' }))).toEqual({ error: 'Post not found' });
  expectNothingWritten();
});

// Success paths: authorize, validate, write, then revalidate 

test('createPost writes with a derived slug, revalidates, then redirects', async () => {
  vi.mocked(getSession).mockResolvedValue(admin);

  await createPost(form({ title: 'Hello World!', content: 'Some content' }));

  expect(createPostRecord).toHaveBeenCalledWith({
    title: 'Hello World!',
    slug: 'hello-world',
    content: 'Some content',
    author: 'Admin',
  });
  expect(revalidatePath).toHaveBeenCalledWith('/');
  expect(redirect).toHaveBeenCalledWith('/admin');
});

test('updatePost writes, revalidates the post page, then redirects', async () => {
  vi.mocked(getSession).mockResolvedValue(admin);

  await updatePost(form({ id: '7', title: 'New title', content: 'New content' }));

  expect(updatePostRecord).toHaveBeenCalledWith(7, { title: 'New title', content: 'New content' });
  expect(revalidatePath).toHaveBeenCalledWith('/posts/existing-post');
  expect(redirect).toHaveBeenCalledWith('/admin');
});

test('deletePost deletes and revalidates', async () => {
  vi.mocked(getSession).mockResolvedValue(admin);

  expect(await deletePost(form({ id: '7' }))).toEqual({ ok: true });
  expect(deletePostRecord).toHaveBeenCalledWith(7);
  expect(revalidatePath).toHaveBeenCalledWith('/posts/existing-post');
});