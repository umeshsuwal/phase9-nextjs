import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type Post = {
  id: number;
  title: string;
  author: string;
  category: string;
  publishedAt: string;
  comments: number;
  content?: string;
};

const DATA_FILE = path.join(process.cwd(), 'data', 'blog-posts.json');

async function readPosts(): Promise<Post[]> {
  const raw = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Post[];
}

export async function getPosts(filters: { author?: string } = {}): Promise<Post[]> {
  const posts = await readPosts();
  return posts
    .filter((post) => !filters.author || post.author === filters.author)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getAuthors(): Promise<string[]> {
  const posts = await readPosts();
  return [...new Set(posts.map((post) => post.author))].sort();
}

export async function addPost(input: {
  title: string;
  content: string;
  author: string;
}): Promise<Post> {
  const posts = await readPosts();
  const post: Post = {
    id: Math.max(0, ...posts.map((p) => p.id)) + 1,
    title: input.title,
    content: input.content,
    author: input.author,
    category: 'General',
    publishedAt: new Date().toISOString().slice(0, 10),
    comments: 0,
  };
  posts.push(post);
  await writeFile(DATA_FILE, JSON.stringify(posts, null, 2));
  return post;
}

export function getServerTime(): string {
  return new Date().toISOString();
}