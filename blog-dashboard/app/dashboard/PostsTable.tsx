import type { Post } from '@/lib/data';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function PostsTable({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p role="status">No posts match this filter.</p>;
  }

  return (
    <div className="table-scroll" role="region" aria-label="Posts table" tabIndex={0}>
      <table>
        <caption>{posts.length} posts, newest first</caption>
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
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </td>
              <td className="num">{post.comments}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}