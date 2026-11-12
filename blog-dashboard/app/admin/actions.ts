'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addPost } from '@/lib/data';
import { getSession } from '@/lib/session';

const schema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1),
});

export async function createPost(formData: FormData) {

  const session = await getSession();
  if (!session || session.role !== 'admin') return { error: 'Not authorized' };

  const parsed = schema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  });
  if (!parsed.success) return { error: 'Invalid input' };

  await addPost({ ...parsed.data, author: session.name });

  revalidatePath('/dashboard');
  revalidatePath('/posts');
  return { ok: true };
}