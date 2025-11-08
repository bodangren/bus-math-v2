import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

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
