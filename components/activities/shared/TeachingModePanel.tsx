'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TeachingModePanelProps {
  title?: string;
  summary: string;
  steps: string[];
  actionLabel?: string;
  className?: string;
}

export function TeachingModePanel({
  title = 'Teaching mode',
  summary,
  steps,
  actionLabel = 'Next step',
  className,
}: TeachingModePanelProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const normalizedSteps = steps.length > 0 ? steps : [summary];
  const activeIndex = activeStepIndex % normalizedSteps.length;

  return (
    <div
      className={cn('rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-4 text-sm text-blue-950 shadow-sm', className)}
      data-teaching-mode
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <Badge variant="secondary" className="bg-white/90 text-blue-700">
            Teaching mode
          </Badge>
          <p className="text-base font-semibold text-blue-950">{title}</p>
          <p className="text-sm text-blue-950/90">{summary}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-blue-200 bg-white/80 text-blue-900 hover:bg-white"
          onClick={() => setActiveStepIndex((current) => (current + 1) % normalizedSteps.length)}
        >
          {actionLabel}
        </Button>
      </div>

      <ol className="mt-4 space-y-2">
        {normalizedSteps.map((step, index) => (
          <li
            key={`${title}-${step}`}
            className={cn(
              'rounded-xl border px-3 py-2 text-sm transition-colors',
              index === activeIndex ? 'border-blue-300 bg-white text-blue-950 shadow-sm' : 'border-blue-100 bg-white/50 text-blue-950/80',
            )}
          >
            <span className="mr-2 font-semibold text-blue-700">{index + 1}.</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}
