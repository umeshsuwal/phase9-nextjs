import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Blog Dashboard',
  description: 'Server-rendered dashboard and caching experiments',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/posts">Posts</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}