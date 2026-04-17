'use client';

import { Component, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class LessonRendererErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('LessonRenderer error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-red-200 bg-red-50">
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-4 text-center">
                <AlertTriangle className="h-10 w-10 text-red-600" />
                <h2 className="text-xl font-semibold text-red-800">
                  Something went wrong loading this lesson
                </h2>
                <p className="text-sm text-red-700 max-w-md">
                  An unexpected error occurred. The lesson content could not be displayed. Please try
                  again or return to the dashboard.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="w-full max-w-lg">
                    <summary className="text-xs cursor-pointer text-red-800 text-left">
                      Error details
                    </summary>
                    <pre className="text-xs mt-2 p-3 bg-red-100 rounded overflow-auto text-red-900 text-left">
                      {this.state.error.message}
                      {'\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
                <div className="flex gap-3 mt-2">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="default"
                    data-testid="lesson-error-refresh-button"
                  >
                    Refresh page
                  </Button>
                  <Button
                    onClick={() => (window.location.href = '/student')}
                    variant="outline"
                    data-testid="lesson-error-dashboard-button"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}