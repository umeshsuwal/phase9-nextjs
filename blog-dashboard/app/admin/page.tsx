import { getSession } from '@/lib/session';
import { signInAsAdmin, signInAsUser, signOut } from './session-actions';
import { CreatePostForm } from './CreatePostForm';

export const instant = false;

export default async function AdminPage() {
  const session = await getSession();

  return (
    <div>
      <h1>Admin</h1>
      <p>
        {session
          ? `Signed in as ${session.name} (${session.role})`
          : 'Not signed in'}
      </p>

      <form>
        <button formAction={signInAsAdmin}>Sign in as admin</button>
        <button formAction={signInAsUser}>Sign in as user</button>
        <button formAction={signOut}>Sign out</button>
      </form>

      <h2>Create a post</h2>
      <CreatePostForm />
    </div>
  );
}