import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/session';
import { listPosts } from '@/lib/posts';
import { logout } from '../login/actions';
import { deletePost } from './actions';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false },
};

export const instant = false;

export default async function AdminPage() {
  const session = await requireAdmin();
  const posts = await listPosts();

  return (
    <div>
      <h1>Admin</h1>
      <p>Signed in as {session.name}.</p>
      <form action={logout}>
        <button type="submit">Sign out</button>
      </form>

      <p>
        <Link className="button-link" href="/admin/new">
          New post
        </Link>
      </p>

      {posts.length === 0 ? (
        <p role="status">No posts yet.</p>
      ) : (
        <div className="table-scroll" role="region" aria-label="Posts table" tabIndex={0}>
          <table>
            <caption>{posts.length} posts</caption>
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Slug</th>
                <th scope="col">Created</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <th scope="row">{post.title}</th>
                  <td>{post.slug}</td>
                  <td>
                    <time dateTime={post.createdAt}>{post.createdAt.slice(0, 10)}</time>
                  </td>
                  <td>
                    <Link href={`/admin/${post.id}/edit`} aria-label={`Edit ${post.title}`}>
                      <span className="button-link button-link-small">Edit</span>
                    </Link>{' '}
                    <form
                      className="inline-form"
                      action={async (formData) => {
                        'use server';
                        const result = await deletePost(formData);
                        if (result.error) throw new Error(result.error);
                      }}
                    >
                      <input type="hidden" name="id" value={post.id} />
                      <button type="submit" aria-label={`Delete ${post.title}`}>
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}