'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import {
  DuplicateSlugError,
  createPostRecord,
  deletePostRecord,
  getPostById,
  slugify,
  updatePostRecord,
} from '@/lib/posts';

const postSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1),
});

const idSchema = z.coerce.number().int().positive();

async function getAdmin() {
  const session = await getSession();
  return session && session.role === 'admin' ? session : null;
}

export async function createPost(formData: FormData) {
  const session = await getAdmin();
  if (!session) return { error: 'Not authorized' };

  const parsed = postSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });
  if (!parsed.success) return { error: 'Invalid input' };

  const slug = slugify(parsed.data.title);
  if (!slug) return { error: 'The title must contain letters or numbers' };

  try {
    await createPostRecord({ ...parsed.data, slug, author: session.name });
  } catch (error) {
    if (error instanceof DuplicateSlugError) {
      return { error: 'A post with this title already exists. Choose a different title.' };
    }
    throw error;
  }

  revalidatePath('/');
  revalidatePath('/admin');
  redirect('/admin');
}

export async function updatePost(formData: FormData) {
  const session = await getAdmin();
  if (!session) return { error: 'Not authorized' };

  const id = idSchema.safeParse(formData.get('id'));
  const parsed = postSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });
  if (!id.success || !parsed.success) return { error: 'Invalid input' };

  const existing = await getPostById(id.data);
  if (!existing) return { error: 'Post not found' };

  await updatePostRecord(id.data, parsed.data);

  revalidatePath('/');
  revalidatePath(`/posts/${existing.slug}`);
  revalidatePath('/admin');
  redirect('/admin');
}

export async function deletePost(formData: FormData) {
  const session = await getAdmin();
  if (!session) return { error: 'Not authorized' };

  const id = idSchema.safeParse(formData.get('id'));
  if (!id.success) return { error: 'Invalid input' };

  const existing = await getPostById(id.data);
  if (!existing) return { error: 'Post not found' };

  await deletePostRecord(id.data);

  revalidatePath('/');
  revalidatePath(`/posts/${existing.slug}`);
  revalidatePath('/admin');
  return { ok: true };
}