import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/session';
import { PostForm } from '../PostForm';

export const metadata: Metadata = {
  title: 'New post',
  robots: { index: false },
};

export const instant = false;

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <div>
      <h1>New post</h1>
      <PostForm mode="create" />
    </div>
  );
}