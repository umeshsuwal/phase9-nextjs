import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Blog CMS',
    template: '%s | Blog CMS',
  },
  description: 'A small blog with a protected admin panel.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/admin">Admin</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}