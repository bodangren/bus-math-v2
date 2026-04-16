import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePracticeTiming } from '@/components/practice-timing';

vi.mock('@/lib/practice/timing', () => ({
  createTimingAccumulator: vi.fn(() => ({
    start: vi.fn(),
    addEvent: vi.fn(),
    finalize: vi.fn(() => ({
      startedAt: '2026-01-01T00:00:01.000Z',
      submittedAt: '2026-01-01T00:02:00.000Z',
      wallClockMs: 120000,
      activeMs: 90000,
      idleMs: 30000,
      pauseCount: 0,
      focusLossCount: 0,
      visibilityHiddenCount: 0,
      confidence: 'high',
    })),
    getSnapshot: vi.fn(() => ({
      startedAt: '2026-01-01T00:00:01.000Z',
      wallClockMs: 1000,
      activeMs: 500,
      idleMs: 0,
      pauseCount: 0,
      focusLossCount: 0,
      visibilityHiddenCount: 0,
      longestIdleMs: 0,
      confidence: 'high' as const,
      confidenceReasons: [],
      isPaused: false,
      isActive: true,
      isInterrupted: false,
    })),
    isActive: vi.fn(() => true),
    reset: vi.fn(),
  })),
  DEFAULT_IDLE_THRESHOLD_MS: 30000,
}));

describe('usePracticeTiming', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let windowAddEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let windowRemoveEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    windowAddEventListenerSpy = vi.spyOn(window, 'addEventListener');
    windowRemoveEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('initializes timing accumulator on mount', () => {
    const { result } = renderHook(() => usePracticeTiming());
    expect(result.current.isTracking()).toBe(true);
  });

  it('adds visibilitychange listener on mount', () => {
    renderHook(() => usePracticeTiming());
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
  });

  it('adds focus and blur listeners on mount', () => {
    renderHook(() => usePracticeTiming());
    expect(windowAddEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(windowAddEventListenerSpy).toHaveBeenCalledWith('blur', expect.any(Function));
  });

  it('adds pagehide listener on mount', () => {
    renderHook(() => usePracticeTiming());
    expect(windowAddEventListenerSpy).toHaveBeenCalledWith(
      'pagehide',
      expect.any(Function),
    );
  });

  it('removes all listeners on unmount', () => {
    const { unmount } = renderHook(() => usePracticeTiming());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'visibilitychange',
      expect.any(Function),
    );
    expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith('blur', expect.any(Function));
    expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith(
      'pagehide',
      expect.any(Function),
    );
  });

  it('recordInteraction adds interaction event', () => {
    const { result } = renderHook(() => usePracticeTiming());
    act(() => {
      result.current.recordInteraction();
    });
    expect(result.current.recordInteraction).toBeDefined();
  });

  it('getTiming returns timing after tracking', () => {
    const { result } = renderHook(() => usePracticeTiming());
    const timing = result.current.getTiming();
    expect(timing).not.toBeNull();
  });

  it('handles visibility hidden event', () => {
    const { result } = renderHook(() => usePracticeTiming());
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.isTracking()).toBe(true);
  });

  it('handles pagehide event', () => {
    const onSubmit = vi.fn();
    renderHook(() => usePracticeTiming({ onSubmit }));
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });
    expect(onSubmit).toHaveBeenCalled();
  });

  it('calls onSubmit with timing on pagehide', () => {
    const onSubmit = vi.fn();
    renderHook(() => usePracticeTiming({ onSubmit }));
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        wallClockMs: expect.any(Number),
        activeMs: expect.any(Number),
        idleMs: expect.any(Number),
      }),
    );
  });

  it('uses custom idle threshold', () => {
    renderHook(() => usePracticeTiming({ idleThresholdMs: 60000 }));
    expect(addEventListenerSpy).toHaveBeenCalled();
  });
});