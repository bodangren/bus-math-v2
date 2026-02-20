import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

class ResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    this.callback(
      [
        {
          contentRect: {
            width: (target as HTMLElement).clientWidth || 600,
            height: (target as HTMLElement).clientHeight || 400
          }
        } as ResizeObserverEntry
      ],
      this
    );
  }

  unobserve() {
    // no-op
  }

  disconnect() {
    // no-op
  }
}

(globalThis as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = ResizeObserver;

import React from 'react';

// Mock Recharts ResponsiveContainer to bypass the -1 width/height strict warning in Vitest
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: (props: any) =>
      React.createElement('div', { style: { width: 800, height: 400 } }, props.children),
    BarChart: (props: any) => React.createElement('div', { 'data-testid': 'recharts-bar-chart' }, props.children),
    LineChart: (props: any) => React.createElement('div', { 'data-testid': 'recharts-line-chart' }, props.children),
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Bar: () => null,
    Line: () => null,
    Tooltip: () => null,
    Legend: (props: any) => {
      const payload = [
        { value: 'Completed', type: 'rect', id: 'completed', color: '#000', dataKey: 'completed' },
        { value: 'Assigned', type: 'rect', id: 'assigned', color: '#000', dataKey: 'assigned' },
        { value: 'Revenue', type: 'line', id: 'revenue', color: '#000', dataKey: 'revenue' },
        { value: 'Expenses', type: 'line', id: 'expenses', color: '#000', dataKey: 'expenses' },
      ];
      if (props.content && React.isValidElement(props.content)) {
        return React.cloneElement(props.content as React.ReactElement<any>, { payload });
      }
      if (typeof props.content === 'function') {
        return React.createElement(props.content, { payload });
      }
      return null;
    },
  };
});
