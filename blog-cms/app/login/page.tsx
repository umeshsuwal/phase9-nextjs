import type { Metadata } from 'next';
import { login } from './actions';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false },
};

export const instant = false;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <h1>Sign in</h1>
      {error && <p role="alert">Invalid email or password.</p>}
      <form action={login}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" />
        </div>
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}