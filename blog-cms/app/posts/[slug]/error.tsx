'use client';

export default function Error({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div role="alert">
      <h1>Something went wrong</h1>
      <p>We could not load this post.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}