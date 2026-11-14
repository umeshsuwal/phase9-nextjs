import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import { getPostById } from '@/lib/posts';
import { PostForm } from '../../PostForm';

export const metadata: Metadata = {
  title: 'Edit post',
  robots: { index: false },
};

export const instant = false;

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const post = Number.isInteger(Number(id)) ? await getPostById(Number(id)) : null;
  if (!post) notFound();

  return (
    <div>
      <h1>Edit post</h1>
      <PostForm mode="edit" post={{ id: post.id, title: post.title, content: post.content }} />
    </div>
  );
}