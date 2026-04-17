'use client';

import { Component, ReactNode } from 'react';
import { ErrorFallback } from '@/components/error-fallback';

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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LessonRenderer error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error ?? undefined}
          title="Something went wrong loading this lesson"
          description="An unexpected error occurred. The lesson content could not be displayed. Please try again or return to the dashboard."
          showRefreshFallback={true}
        />
      );
    }

    return this.props.children;
  }
}
