import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type Post = {
  id: number;
  slug: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
};

export class DuplicateSlugError extends Error {
  constructor(slug: string) {
    super(`A post with the slug "${slug}" already exists`);
    this.name = 'DuplicateSlugError';
  }
}

const DATA_FILE = path.join(process.cwd(), 'data', 'posts.json');

// Pure helpers 
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 80)
    .replace(/^-+|-+$/g, '');
}

export function makeExcerpt(content: string, maxLength = 155): string {
  const text = content.replace(/\s+/g, ' ').trim();
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

// ---- Data layer (the Phase 6 repository pattern) ----------------------------
// Everything below is the ONLY code that touches storage. To use your Phase 6
// Prisma database, re-implement these functions with the same signatures.

async function readPosts(): Promise<Post[]> {
  const raw = await readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as Post[];
}

async function writePosts(posts: Post[]): Promise<void> {
  await writeFile(DATA_FILE, JSON.stringify(posts, null, 2));
}

export async function listPosts(): Promise<Post[]> {
  const posts = await readPosts();
  return posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await readPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getPostById(id: number): Promise<Post | null> {
  const posts = await readPosts();
  return posts.find((post) => post.id === id) ?? null;
}

export async function createPostRecord(input: {
  title: string;
  slug: string;
  content: string;
  author: string;
}): Promise<Post> {
  const posts = await readPosts();
  if (posts.some((post) => post.slug === input.slug)) {
    throw new DuplicateSlugError(input.slug);
  }

  const now = new Date().toISOString();
  const post: Post = {
    id: Math.max(0, ...posts.map((p) => p.id)) + 1,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  await writePosts([...posts, post]);
  return post;
}

export async function updatePostRecord(
  id: number,
  input: { title: string; content: string }
): Promise<Post | null> {
  const posts = await readPosts();
  const index = posts.findIndex((post) => post.id === id);
  if (index === -1) return null;

  const updated: Post = {
    ...posts[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  posts[index] = updated;
  await writePosts(posts);
  return updated;
}

export async function deletePostRecord(id: number): Promise<boolean> {
  const posts = await readPosts();
  const remaining = posts.filter((post) => post.id !== id);
  if (remaining.length === posts.length) return false;
  await writePosts(remaining);
  return true;
}