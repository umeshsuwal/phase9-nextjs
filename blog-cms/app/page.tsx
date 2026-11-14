import Link from 'next/link';
import { Suspense } from 'react';
import { listPosts, makeExcerpt } from '@/lib/posts';

export default async function HomePage() {
  return (
    <div>
      <h1>Blog</h1>
      <Suspense fallback={<p role="status">Loading posts...</p>}>
        <PostList />
      </Suspense>
    </div>
  );
}

async function PostList() {
  const posts = await listPosts();

  return posts.length === 0 ? (
    <p role="status">No posts yet.</p>
  ) : (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post.id}>
          <h2>
            <Link href={`/posts/${post.slug}`}>{post.title}</Link>
          </h2>
          <p className="meta">
            By {post.author} on{' '}
            <time dateTime={post.createdAt}>{post.createdAt.slice(0, 10)}</time>
          </p>
          <p>{makeExcerpt(post.content)}</p>
        </li>
      ))}
    </ul>
  );
}