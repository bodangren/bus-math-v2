'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  reset?: () => void;
  title?: string;
  description?: string;
  showRefreshFallback?: boolean;
}

export function ErrorFallback({
  error,
  reset,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again or refresh the page.',
  showRefreshFallback = true,
}: ErrorFallbackProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700">{description}</p>
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4">
              <summary className="text-xs cursor-pointer text-red-800">Error details</summary>
              <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto text-red-900">
                {error.message}
                {'\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          {reset && (
            <Button onClick={reset} variant="default" data-testid="error-reset-button">
              Try again
            </Button>
          )}
          {showRefreshFallback && !reset && (
            <Button
              onClick={() => window.location.reload()}
              variant="default"
              data-testid="error-refresh-button"
            >
              Refresh page
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
