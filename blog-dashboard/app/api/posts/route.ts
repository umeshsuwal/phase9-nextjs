import { getPosts } from '@/lib/data';

export async function GET() {
  const posts = await getPosts();

  return Response.json(
    posts.map(({ id, title, author, publishedAt, comments }) => ({
      id,
      title,
      author,
      publishedAt,
      comments,
    }))
  );
}