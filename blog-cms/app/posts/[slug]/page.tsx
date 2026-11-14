import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, makeExcerpt } from '@/lib/posts';

type Props = { params: Promise<{ slug: string }> };

export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return { title: 'Post not found' };

  return {
    title: post.title,
    description: makeExcerpt(post.content),
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  return (
    <article>
      <h1>{post.title}</h1>
      <p className="meta">
        By {post.author} on <time dateTime={post.createdAt}>{post.createdAt.slice(0, 10)}</time>
      </p>
      {post.content.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </article>
  );
}