import { describe, it, expect } from 'vitest';
import {
  createTimingAccumulator,
  DEFAULT_IDLE_THRESHOLD_MS,
  type TimingEvent,
} from '@/lib/practice/timing';

describe('TimingAccumulator', () => {
  function interaction(offsetMs: number): TimingEvent {
    return { type: 'interaction', timestamp: 1000 + offsetMs };
  }

  function idle(offsetMs: number): TimingEvent {
    return { type: 'idle', timestamp: 1000 + offsetMs };
  }

  function blur(offsetMs: number): TimingEvent {
    return { type: 'blur', timestamp: 1000 + offsetMs };
  }

  function focus(offsetMs: number): TimingEvent {
    return { type: 'focus', timestamp: 1000 + offsetMs };
  }

  function visibilityHidden(offsetMs: number): TimingEvent {
    return { type: 'visibility_hidden', timestamp: 1000 + offsetMs };
  }

  function visibilityVisible(offsetMs: number): TimingEvent {
    return { type: 'visibility_visible', timestamp: 1000 + offsetMs };
  }

  function pause(offsetMs: number): TimingEvent {
    return { type: 'pause', timestamp: 1000 + offsetMs };
  }

  function resume(offsetMs: number): TimingEvent {
    return { type: 'resume', timestamp: 1000 + offsetMs };
  }

  function pagehide(offsetMs: number): TimingEvent {
    return { type: 'pagehide', timestamp: 1000 + offsetMs };
  }

  describe('initial state', () => {
    it('creates accumulator with zeroed values', () => {
      const acc = createTimingAccumulator();
      const snap = acc.getSnapshot();
      expect(snap.wallClockMs).toBe(0);
      expect(snap.activeMs).toBe(0);
      expect(snap.idleMs).toBe(0);
      expect(snap.pauseCount).toBe(0);
      expect(snap.focusLossCount).toBe(0);
      expect(snap.visibilityHiddenCount).toBe(0);
      expect(snap.confidence).toBe('high');
    });

    it('starts with no startedAt', () => {
      const acc = createTimingAccumulator();
      expect(acc.getSnapshot().startedAt).toBeNull();
    });

    it('uses default idle threshold of 30 seconds', () => {
      const acc = createTimingAccumulator();
      expect(acc.getIdleThresholdMs()).toBe(DEFAULT_IDLE_THRESHOLD_MS);
    });

    it('accepts custom idle threshold', () => {
      const acc = createTimingAccumulator({ idleThresholdMs: 60000 });
      expect(acc.getIdleThresholdMs()).toBe(60000);
    });
  });

  describe('start', () => {
    it('sets startedAt on start', () => {
      const acc = createTimingAccumulator();
      acc.start(5000);
      expect(acc.getSnapshot().startedAt).toBe('1970-01-01T00:00:05.000Z');
    });

    it('transitions state to active', () => {
      const acc = createTimingAccumulator();
      acc.start(5000);
      expect(acc.isActive()).toBe(true);
    });
  });

  describe('wall-clock and active time accumulation', () => {
    it('accumulates wall-clock time on each event', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(interaction(1000));
      acc.addEvent(interaction(2000));
      acc.addEvent(interaction(3000));
      const snap = acc.getSnapshot();
      expect(snap.wallClockMs).toBe(3000);
    });

    it('accumulates active time for interaction events', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(interaction(1000));
      acc.addEvent(interaction(2000));
      const snap = acc.getSnapshot();
      expect(snap.activeMs).toBe(2000);
    });

    it('interaction gap within threshold counts as active time', () => {
      const acc = createTimingAccumulator({ idleThresholdMs: 30000 });
      acc.start(1000);
      acc.addEvent(interaction(1000));
      acc.addEvent(interaction(5000));
      const snap = acc.getSnapshot();
      expect(snap.activeMs).toBe(5000);
      expect(snap.idleMs).toBe(0);
    });

    it('tracks longest idle from explicit idle events', () => {
      const acc = createTimingAccumulator({ idleThresholdMs: 30000 });
      acc.start(1000);
      acc.addEvent(interaction(1000));
      acc.addEvent(idle(5000));
      acc.addEvent(interaction(45000));
      const snap = acc.getSnapshot();
      expect(snap.longestIdleMs).toBe(40000);
    });

    it('auto-detects long gap as idle', () => {
      const acc = createTimingAccumulator({ idleThresholdMs: 30000 });
      acc.start(1000);
      acc.addEvent(interaction(1000));
      acc.addEvent(interaction(40000));
      const snap = acc.getSnapshot();
      expect(snap.idleMs).toBe(9000);
    });
  });

  describe('idle threshold handling', () => {
    it('treats gap beyond threshold as idle', () => {
      const acc = createTimingAccumulator({ idleThresholdMs: 30000 });
      acc.start(1000);
      acc.addEvent(interaction(1000));
      acc.addEvent(interaction(40000));
      const snap = acc.getSnapshot();
      expect(snap.idleMs).toBe(9000);
      expect(snap.confidence).toBe('medium');
    });

    it('accumulates idle time across multiple idle periods', () => {
      const acc = createTimingAccumulator({ idleThresholdMs: 30000 });
      acc.start(1000);
      acc.addEvent(interaction(1000));
      acc.addEvent(idle(5000));
      acc.addEvent(interaction(40000));
      acc.addEvent(idle(10000));
      acc.addEvent(interaction(120000));
      const snap = acc.getSnapshot();
      expect(snap.idleMs).toBe(55000);
    });
  });

  describe('pause/resume behavior', () => {
    it('pause increments pauseCount', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(pause(5000));
      expect(acc.getSnapshot().pauseCount).toBe(1);
    });

    it('resume after pause continues timing', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(pause(5000));
      acc.addEvent(resume(10000));
      acc.addEvent(interaction(12000));
      const snap = acc.getSnapshot();
      expect(snap.activeMs).toBe(2000);
    });

    it('pause sets isPaused state', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      expect(acc.getSnapshot().isPaused).toBe(false);
      acc.addEvent(pause(5000));
      expect(acc.getSnapshot().isPaused).toBe(true);
    });
  });

  describe('focus loss handling', () => {
    it('blur increments focusLossCount', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(blur(5000));
      expect(acc.getSnapshot().focusLossCount).toBe(1);
    });

    it('focus after blur tracks time correctly', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(blur(5000));
      acc.addEvent(focus(10000));
      acc.addEvent(interaction(11000));
      const snap = acc.getSnapshot();
      expect(snap.activeMs).toBe(6000);
    });

    it('short focus loss keeps confidence at medium', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(blur(5000));
      acc.addEvent(focus(7000));
      const snap = acc.getSnapshot();
      expect(snap.confidence).toBe('medium');
    });
  });

  describe('visibility hidden handling', () => {
    it('visibility_hidden increments visibilityHiddenCount', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(visibilityHidden(5000));
      expect(acc.getSnapshot().visibilityHiddenCount).toBe(1);
    });

    it('hidden tab time is not counted as active', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(visibilityHidden(5000));
      acc.addEvent(visibilityVisible(10000));
      acc.addEvent(interaction(11000));
      const snap = acc.getSnapshot();
      expect(snap.activeMs).toBe(6000);
    });

    it('short hidden interval keeps confidence at medium', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(visibilityHidden(5000));
      acc.addEvent(visibilityVisible(7000));
      const snap = acc.getSnapshot();
      expect(snap.confidence).toBe('medium');
    });
  });

  describe('confidence downgrade reasons', () => {
    it('records focus_loss in confidenceReasons', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(blur(5000));
      acc.addEvent(focus(20000));
      const snap = acc.getSnapshot();
      expect(snap.confidenceReasons).toContain('focus_loss');
    });

    it('records visibility_hidden in confidenceReasons', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(visibilityHidden(5000));
      acc.addEvent(visibilityVisible(25000));
      const snap = acc.getSnapshot();
      expect(snap.confidenceReasons).toContain('visibility_hidden');
    });

    it('records long_idle in confidenceReasons', () => {
      const acc = createTimingAccumulator({ idleThresholdMs: 30000 });
      acc.start(1000);
      acc.addEvent(interaction(1000));
      acc.addEvent(interaction(40000));
      const snap = acc.getSnapshot();
      expect(snap.confidenceReasons).toContain('long_idle');
    });

    it('records interrupted in confidenceReasons for pagehide', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(pagehide(5000));
      const snap = acc.getSnapshot();
      expect(snap.confidenceReasons).toContain('interrupted');
    });

    it('downgrades confidence to medium for multiple focus losses', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(blur(5000));
      acc.addEvent(focus(12000));
      acc.addEvent(blur(15000));
      acc.addEvent(focus(22000));
      const snap = acc.getSnapshot();
      expect(snap.confidence).toBe('medium');
    });

    it('downgrades confidence to low for long hidden tab', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(visibilityHidden(5000));
      acc.addEvent(visibilityVisible(65000));
      const snap = acc.getSnapshot();
      expect(snap.confidence).toBe('low');
    });
  });

  describe('pagehide handling', () => {
    it('pagehide marks session as interrupted', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(pagehide(5000));
      expect(acc.getSnapshot().isInterrupted).toBe(true);
    });

    it('pagehide finalizes wallClockMs', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(pagehide(5000));
      const snap = acc.getSnapshot();
      expect(snap.wallClockMs).toBe(5000);
    });

    it('isActive returns false after pagehide', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(pagehide(5000));
      expect(acc.isActive()).toBe(false);
    });
  });

  describe('finalize', () => {
    it('finalize returns timing summary', () => {
      const acc = createTimingAccumulator({ idleThresholdMs: 30000 });
      acc.start(1000);
      acc.addEvent(interaction(1000));
      acc.addEvent(interaction(5000));
      acc.addEvent(blur(8000));
      acc.addEvent(focus(12000));
      const summary = acc.finalize(20000);
      expect(summary.startedAt).toBe('1970-01-01T00:00:01.000Z');
      expect(summary.submittedAt).toBe('1970-01-01T00:00:20.000Z');
      expect(summary.wallClockMs).toBe(19000);
      expect(summary.pauseCount).toBe(0);
      expect(summary.focusLossCount).toBe(1);
      expect(summary.visibilityHiddenCount).toBe(0);
      expect(summary.confidence).toBe('medium');
    });

    it('finalize throws if not started', () => {
      const acc = createTimingAccumulator();
      expect(() => acc.finalize(10000)).toThrow('Cannot finalize before start');
    });

    it('finalize twice returns consistent result', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(interaction(1000));
      const first = acc.finalize(5000);
      const second = acc.finalize(10000);
      expect(first.wallClockMs).toBe(4000);
      expect(second.wallClockMs).toBe(4000);
    });
  });

  describe('reset', () => {
    it('reset clears all state', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(interaction(1000));
      acc.addEvent(blur(5000));
      acc.reset();
      const snap = acc.getSnapshot();
      expect(snap.wallClockMs).toBe(0);
      expect(snap.activeMs).toBe(0);
      expect(snap.startedAt).toBeNull();
      expect(snap.confidence).toBe('high');
    });
  });

  describe('isActive', () => {
    it('returns true after start', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      expect(acc.isActive()).toBe(true);
    });

    it('returns false after finalize', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.finalize(5000);
      expect(acc.isActive()).toBe(false);
    });

    it('returns false after reset', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.reset();
      expect(acc.isActive()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles events out of order by timestamp', () => {
      const acc = createTimingAccumulator({ idleThresholdMs: 30000 });
      acc.start(1000);
      acc.addEvent(visibilityHidden(5000));
      acc.addEvent(interaction(3000));
      const snap = acc.getSnapshot();
      expect(snap.wallClockMs).toBe(5000);
    });

    it('handles very short active intervals', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(interaction(1));
      const snap = acc.getSnapshot();
      expect(snap.activeMs).toBe(1);
    });

    it('gracefully handles events before start', () => {
      const acc = createTimingAccumulator();
      acc.addEvent(interaction(1000));
      const snap = acc.getSnapshot();
      expect(snap.wallClockMs).toBe(0);
    });
  });

  describe('confidence', () => {
    it('confidence is high by default', () => {
      const acc = createTimingAccumulator();
      expect(acc.getSnapshot().confidence).toBe('high');
    });

    it('confidence downgrade to medium for single long focus loss', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(blur(5000));
      acc.addEvent(focus(40000));
      expect(acc.getSnapshot().confidence).toBe('medium');
    });

    it('confidence downgrade to low for pagehide after short session', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(pagehide(5000));
      expect(acc.getSnapshot().confidence).toBe('low');
    });

    it('confidence stays high with no issues', () => {
      const acc = createTimingAccumulator();
      acc.start(1000);
      acc.addEvent(interaction(1000));
      acc.addEvent(interaction(5000));
      acc.addEvent(interaction(10000));
      expect(acc.getSnapshot().confidence).toBe('high');
    });

    it('downgrades to low for very long idle', () => {
      const acc = createTimingAccumulator({ idleThresholdMs: 30000 });
      acc.start(1000);
      acc.addEvent(interaction(1000));
      acc.addEvent(idle(5000));
      acc.addEvent(interaction(90000));
      expect(acc.getSnapshot().confidence).toBe('low');
    });
  });
});