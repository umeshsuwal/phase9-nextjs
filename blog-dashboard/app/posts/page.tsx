import { Suspense } from 'react';
import { connection } from 'next/server';
import { getPosts, getServerTime } from '@/lib/data';

async function ServerTime() {
  await connection();
  return getServerTime();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      <h1>Posts</h1>
      <Suspense fallback={<p>Rendered at: Loading...</p>}>
        <p>Rendered at: <ServerTime /></p>
      </Suspense>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}