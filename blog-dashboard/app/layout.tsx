import type { ReactNode } from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Blog Dashboard',
  description: 'Server-rendered dashboard and caching experiments',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/posts">Posts</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/admin">Admin</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}