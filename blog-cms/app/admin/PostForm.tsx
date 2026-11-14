'use client';

import { useActionState } from 'react';
import { createPost, updatePost } from './actions';

type Result = { error?: string } | null;

type Props = {
  mode: 'create' | 'edit';
  post?: { id: number; title: string; content: string };
};

export function PostForm({ mode, post }: Props) {
  const action = mode === 'create' ? createPost : updatePost;

  const [result, formAction, pending] = useActionState<Result, FormData>(
    async (_previous, formData) => action(formData),
    null
  );

  return (
    <form action={formAction}>
      {mode === 'edit' && post && <input type="hidden" name="id" value={post.id} />}

      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" defaultValue={post?.title ?? ''} maxLength={120} />
      </div>
      <div>
        <label htmlFor="content">Content</label>
        <textarea id="content" name="content" rows={10} defaultValue={post?.content ?? ''} />
      </div>

      <button type="submit" disabled={pending}>
        {pending ? 'Saving...' : mode === 'create' ? 'Create post' : 'Save changes'}
      </button>
      {result?.error && <p role="alert">{result.error}</p>}
    </form>
  );
}