import { getAuthors, getPosts } from '@/lib/data';
import { PostsTable } from './PostsTable';
import { CommentsChart } from './CommentsChart';

export const instant = false;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ author?: string | string[] }>;
}) {
  const params = await searchParams;
  const author = typeof params.author === 'string' ? params.author : undefined;

  const [posts, authors] = await Promise.all([getPosts({ author }), getAuthors()]);

  const totals: Record<string, number> = {};
  for (const post of posts) {
    totals[post.author] = (totals[post.author] ?? 0) + post.comments;
  }
  const chartData = Object.entries(totals).map(([name, comments]) => ({
    author: name,
    comments,
  }));

  return (
    <div>
      <h1>Dashboard</h1>

      <section aria-labelledby="filter-heading">
        <h2 id="filter-heading">Filter</h2>
        <form method="get">
          <label htmlFor="author">Author</label>
          <select id="author" name="author" defaultValue={author ?? ''}>
            <option value="">All authors</option>
            {authors.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button type="submit">Filter</button>
        </form>
      </section>

      <section aria-labelledby="chart-heading">
        <h2 id="chart-heading">Comments by author</h2>
        <CommentsChart data={chartData} />
      </section>

      <section aria-labelledby="table-heading">
        <h2 id="table-heading">Posts</h2>
        <PostsTable posts={posts} />
      </section>
    </div>
  );
}