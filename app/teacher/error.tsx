'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/error-fallback';

interface TeacherErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TeacherError({ error, reset }: TeacherErrorProps) {
  useEffect(() => {
    console.error('Teacher route error:', error);
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Unable to load page"
      description="We ran into a problem loading this page. Please try again."
    />
  );
}