'use client';

import { useActionState } from 'react';
import { createPost } from './actions';

type Result = { error?: string; ok?: boolean } | null;

export function CreatePostForm() {
  const [result, formAction, pending] = useActionState<Result, FormData>(
    async (_previous, formData) => createPost(formData),
    null
  );

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" />
      </div>
      <div>
        <label htmlFor="content">Content</label>
        <textarea id="content" name="content" rows={4} />
      </div>
      <button type="submit" disabled={pending}>
        {pending ? 'Saving...' : 'Create post'}
      </button>
      {result?.error && <p role="alert">{result.error}</p>}
      {result?.ok && <p role="status">Post created.</p>}
    </form>
  );
}