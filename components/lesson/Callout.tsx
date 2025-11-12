'use client';

import { cn } from '@/lib/utils';
import { AlertCircle, Info, Lightbulb, AlertTriangle } from 'lucide-react';

type CalloutVariant = 'why-this-matters' | 'tip' | 'warning' | 'example';

interface CalloutProps {
  variant: CalloutVariant;
  content: string;
  className?: string;
}

const variantConfig = {
  'why-this-matters': {
    icon: Info,
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    borderColor: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-600 dark:text-blue-400',
    title: 'Why This Matters',
  },
  tip: {
    icon: Lightbulb,
    bgColor: 'bg-green-50 dark:bg-green-950',
    borderColor: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-600 dark:text-green-400',
    title: 'Tip',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    title: 'Warning',
  },
  example: {
    icon: AlertCircle,
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    borderColor: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-600 dark:text-purple-400',
    title: 'Example',
  },
};

export function Callout({ variant, content, className }: CalloutProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-lg border-l-4 p-4 my-4',
        config.bgColor,
        config.borderColor,
        className
      )}
      role="alert"
      aria-label={config.title}
    >
      <div className="flex gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{config.title}</h4>
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
}
