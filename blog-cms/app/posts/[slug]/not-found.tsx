import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h1>Post not found</h1>
      <p>There is no post with that address.</p>
      <Link href="/">Back to all posts</Link>
    </div>
  );
}