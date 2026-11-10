import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type Post = {
  id: number;
  title: string;
  author: string;
  category: string;
  publishedAt: string;
  comments: number;
};

const DATA_FILE = path.join(process.cwd(), 'data', 'blog-posts.json');

export async function getPosts(): Promise<Post[]> {
  'use cache';

  const raw = await readFile(DATA_FILE, 'utf-8');
  const posts: Post[] = JSON.parse(raw);
  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getServerTime(): string {
  return new Date().toISOString();
}