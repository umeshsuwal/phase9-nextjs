import { Suspense } from 'react';
import { connection } from 'next/server';
import { getPosts, getServerTime } from '@/lib/data';

async function ServerTime() {
  await connection();
  return getServerTime();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function DashboardPage() {
  // Artificial delay so loading.tsx is visible. Remove it when you are done testing.
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const posts = await getPosts();
  const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        {posts.length} posts, {totalComments} comments. Loaded on the server at{' '}
        <Suspense fallback={<span>Loading...</span>}>
          <ServerTime />
        </Suspense>
        .
      </p>

      <section aria-labelledby="chart-heading">
        <h2 id="chart-heading">Comments by author</h2>
        <div className="chart-placeholder">Chart coming soon</div>
      </section>

      <section aria-labelledby="table-heading">
        <h2 id="table-heading">Posts</h2>
        <div
          className="table-scroll"
          role="region"
          aria-label="Posts table"
          tabIndex={0}
        >
          <table>
            <caption>All posts, newest first</caption>
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Author</th>
                <th scope="col">Category</th>
                <th scope="col">Published</th>
                <th scope="col" className="num">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <th scope="row">{post.title}</th>
                  <td>{post.author}</td>
                  <td>{post.category}</td>
                  <td>
                    <time dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt)}
                    </time>
                  </td>
                  <td className="num">{post.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}   
