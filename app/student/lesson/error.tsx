'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/error-fallback';
import { studentDashboardPath } from '@/lib/student/navigation';

interface LessonErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LessonError({ error, reset }: LessonErrorProps) {
  useEffect(() => {
    console.error('Lesson route error:', error);
  }, [error]);

  return (
    <div className="p-4">
      <ErrorFallback
        error={error}
        reset={reset}
        title="Unable to load lesson"
        description="We ran into a problem loading this lesson. Please try again."
      />
      <div className="text-center mt-4">
        <a
          href={studentDashboardPath()}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
          data-testid="back-to-dashboard-link"
        >
          &larr; Back to Dashboard
        </a>
      </div>
    </div>
  );
}
