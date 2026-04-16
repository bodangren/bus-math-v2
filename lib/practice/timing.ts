import type { PracticeTimingSummary, PracticeTimingConfidence } from './contract';

export type { PracticeTimingSummary, PracticeTimingConfidence };

export const DEFAULT_IDLE_THRESHOLD_MS = 30000;

export type TimingEventType =
  | 'start'
  | 'interaction'
  | 'pause'
  | 'resume'
  | 'blur'
  | 'focus'
  | 'visibility_hidden'
  | 'visibility_visible'
  | 'idle'
  | 'pagehide';

export interface TimingEvent {
  type: TimingEventType;
  timestamp: number;
}

export interface TimingAccumulatorSnapshot {
  startedAt: string | null;
  wallClockMs: number;
  activeMs: number;
  idleMs: number;
  pauseCount: number;
  focusLossCount: number;
  visibilityHiddenCount: number;
  longestIdleMs: number;
  confidence: PracticeTimingConfidence;
  confidenceReasons: string[];
  isPaused: boolean;
  isActive: boolean;
  isInterrupted: boolean;
}

export interface TimingAccumulatorOptions {
  idleThresholdMs?: number;
}

interface InternalState {
  startedAt: number | null;
  lastEventTime: number | null;
  isPaused: boolean;
  isInterrupted: boolean;
  isFinalized: boolean;
  wallClockMs: number;
  activeMs: number;
  idleMs: number;
  pauseCount: number;
  focusLossCount: number;
  visibilityHiddenCount: number;
  longestIdleMs: number;
  confidence: PracticeTimingConfidence;
  confidenceReasons: string[];
  lastActiveTime: number | null;
  idleStartTime: number | null;
  hiddenStartTime: number | null;
  blurStartTime: number | null;
  totalFocusLossMs: number;
}

export class TimingAccumulator {
  private state: InternalState;
  private readonly idleThresholdMs: number;

  constructor(options: TimingAccumulatorOptions = {}) {
    this.idleThresholdMs = options.idleThresholdMs ?? DEFAULT_IDLE_THRESHOLD_MS;
    this.state = this.createInitialState();
  }

  private createInitialState(): InternalState {
    return {
      startedAt: null,
      lastEventTime: null,
      isPaused: false,
      isInterrupted: false,
      isFinalized: false,
      wallClockMs: 0,
      activeMs: 0,
      idleMs: 0,
      pauseCount: 0,
      focusLossCount: 0,
      visibilityHiddenCount: 0,
      longestIdleMs: 0,
      confidence: 'high',
      confidenceReasons: [],
      lastActiveTime: null,
      idleStartTime: null,
      hiddenStartTime: null,
      blurStartTime: null,
      totalFocusLossMs: 0,
    };
  }

  start(timestamp: number): void {
    this.state.startedAt = timestamp;
    this.state.lastEventTime = timestamp;
    this.state.lastActiveTime = timestamp;
    this.state.isPaused = false;
  }

  addEvent(event: TimingEvent): void {
    if (this.state.startedAt === null) {
      return;
    }

    const prevTime = this.state.lastEventTime ?? this.state.startedAt;
    const delta = event.timestamp - prevTime;

    if (delta < 0) {
      this.state.lastEventTime = event.timestamp;
      return;
    }

    this.state.wallClockMs += delta;

    switch (event.type) {
      case 'interaction':
        this.handleInteraction(prevTime, event.timestamp);
        break;
      case 'pause':
        this.handlePause();
        break;
      case 'resume':
        this.handleResume(event.timestamp);
        break;
      case 'blur':
        this.handleBlur(prevTime, event.timestamp);
        break;
      case 'focus':
        this.handleFocus(event.timestamp);
        break;
      case 'visibility_hidden':
        this.handleVisibilityHidden(prevTime, event.timestamp);
        break;
      case 'visibility_visible':
        this.handleVisibilityVisible(event.timestamp);
        break;
      case 'idle':
        this.handleIdle(event.timestamp);
        break;
      case 'pagehide':
        this.handlePageHide(event.timestamp);
        break;
    }

    this.state.lastEventTime = event.timestamp;
  }

  private handleInteraction(prevTime: number, currTime: number): void {
    if (this.state.idleStartTime !== null) {
      const idleDuration = currTime - this.state.idleStartTime;
      const idleDelta = idleDuration - this.idleThresholdMs;
      if (idleDelta > 0) {
        this.state.idleMs += idleDelta;
      }
      if (idleDuration > this.state.longestIdleMs) {
        this.state.longestIdleMs = idleDuration;
      }
      if (idleDuration > this.idleThresholdMs) {
        if (!this.state.confidenceReasons.includes('long_idle')) {
          this.state.confidenceReasons.push('long_idle');
        }
      }
      this.state.idleStartTime = null;
      this.state.lastActiveTime = currTime;
      return;
    }

    if (this.state.hiddenStartTime !== null) {
      this.state.hiddenStartTime = null;
    }

    if (this.state.isPaused) {
      this.state.lastActiveTime = currTime;
      return;
    }

    if (this.state.lastActiveTime !== null) {
      const gap = currTime - this.state.lastActiveTime;
      if (gap > this.idleThresholdMs) {
        const idleDelta = gap - this.idleThresholdMs;
        this.state.idleMs += idleDelta;
        if (gap > this.state.longestIdleMs) {
          this.state.longestIdleMs = gap;
        }
        if (!this.state.confidenceReasons.includes('long_idle')) {
          this.state.confidenceReasons.push('long_idle');
        }
      } else {
        const activeDelta = currTime - this.state.lastActiveTime;
        this.state.activeMs += Math.max(0, activeDelta);
      }
    }

    this.state.lastActiveTime = currTime;
  }

  private handlePause(): void {
    if (!this.state.isPaused) {
      this.state.isPaused = true;
      this.state.pauseCount++;
    }
  }

  private handleResume(timestamp: number): void {
    if (this.state.isPaused) {
      this.state.isPaused = false;
      this.state.lastActiveTime = timestamp;
    }
  }

  private handleBlur(prevTime: number, currTime: number): void {
    this.state.focusLossCount++;

    if (!this.state.isPaused) {
      if (this.state.lastActiveTime !== null) {
        const gap = currTime - this.state.lastActiveTime;
        if (gap > this.idleThresholdMs) {
          const idleDelta = gap - this.idleThresholdMs;
          this.state.idleMs += idleDelta;
          if (idleDelta > this.state.longestIdleMs) {
            this.state.longestIdleMs = idleDelta;
          }
        } else {
          const activeDelta = currTime - this.state.lastActiveTime;
          this.state.activeMs += Math.max(0, activeDelta);
        }
      }
      this.state.lastActiveTime = null;
    }

    this.state.blurStartTime = currTime;
  }

  private handleFocus(currTime: number): void {
    if (this.state.blurStartTime !== null) {
      const blurDuration = currTime - this.state.blurStartTime;
      this.state.totalFocusLossMs += blurDuration;

      if (blurDuration > 10000) {
        this.state.confidence = 'medium';
        if (!this.state.confidenceReasons.includes('focus_loss')) {
          this.state.confidenceReasons.push('focus_loss');
        }
      }

      this.state.blurStartTime = null;
    }

    if (!this.state.isPaused) {
      this.state.lastActiveTime = currTime;
    }
  }

  private handleVisibilityHidden(prevTime: number, currTime: number): void {
    this.state.visibilityHiddenCount++;

    if (!this.state.isPaused) {
      if (this.state.lastActiveTime !== null) {
        const gap = currTime - this.state.lastActiveTime;
        if (gap > this.idleThresholdMs) {
          const idleDelta = gap - this.idleThresholdMs;
          this.state.idleMs += idleDelta;
          if (idleDelta > this.state.longestIdleMs) {
            this.state.longestIdleMs = idleDelta;
          }
        } else {
          const activeDelta = currTime - this.state.lastActiveTime;
          this.state.activeMs += Math.max(0, activeDelta);
        }
      }
      this.state.lastActiveTime = null;
    }

    this.state.hiddenStartTime = currTime;
  }

  private handleVisibilityVisible(currTime: number): void {
    if (this.state.hiddenStartTime !== null) {
      const hiddenDuration = currTime - this.state.hiddenStartTime;

      if (hiddenDuration >= 60000) {
        this.state.confidence = 'low';
      } else if (hiddenDuration > 10000 && this.state.confidence === 'high') {
        this.state.confidence = 'medium';
      }

      if (hiddenDuration > 10000) {
        if (!this.state.confidenceReasons.includes('visibility_hidden')) {
          this.state.confidenceReasons.push('visibility_hidden');
        }
      }

      this.state.hiddenStartTime = null;
    }

    if (!this.state.isPaused) {
      this.state.lastActiveTime = currTime;
    }
  }

  private handleIdle(timestamp: number): void {
    if (this.state.idleStartTime === null) {
      this.state.idleStartTime = timestamp;
    }
  }

  private handlePageHide(timestamp: number): void {
    this.state.isInterrupted = true;

    if (!this.state.isPaused && this.state.lastActiveTime !== null) {
      const activeDelta = timestamp - this.state.lastActiveTime;
      this.state.activeMs += Math.max(0, activeDelta);
    }

    if (this.state.startedAt !== null) {
      this.state.wallClockMs = timestamp - this.state.startedAt;
    }

    if (!this.state.confidenceReasons.includes('interrupted')) {
      this.state.confidenceReasons.push('interrupted');
    }

    if (this.state.wallClockMs < 30000) {
      this.state.confidence = 'low';
    } else if (this.state.confidence === 'high') {
      this.state.confidence = 'medium';
    }
  }

  private recalculateConfidence(): void {
    if (this.state.confidence === 'low') {
      return;
    }

    if (
      this.state.focusLossCount > 3 ||
      this.state.longestIdleMs > this.idleThresholdMs * 2
    ) {
      this.state.confidence = 'low';
      return;
    }

    if (this.state.confidence === 'medium') {
      return;
    }

    if (
      this.state.focusLossCount > 0 ||
      this.state.visibilityHiddenCount > 0 ||
      this.state.longestIdleMs > this.idleThresholdMs
    ) {
      this.state.confidence = 'medium';
    }
  }

  getSnapshot(): TimingAccumulatorSnapshot {
    this.recalculateConfidence();
    return {
      startedAt:
        this.state.startedAt !== null
          ? new Date(this.state.startedAt).toISOString()
          : null,
      wallClockMs: this.state.wallClockMs,
      activeMs: this.state.activeMs,
      idleMs: this.state.idleMs,
      pauseCount: this.state.pauseCount,
      focusLossCount: this.state.focusLossCount,
      visibilityHiddenCount: this.state.visibilityHiddenCount,
      longestIdleMs: this.state.longestIdleMs,
      confidence: this.state.confidence,
      confidenceReasons: [...this.state.confidenceReasons],
      isPaused: this.state.isPaused,
      isActive: this.state.startedAt !== null && !this.state.isInterrupted,
      isInterrupted: this.state.isInterrupted,
    };
  }

  getIdleThresholdMs(): number {
    return this.idleThresholdMs;
  }

  isActive(): boolean {
    return (
      this.state.startedAt !== null &&
      !this.state.isInterrupted &&
      !this.state.isFinalized
    );
  }

  finalize(submittedAt: number): PracticeTimingSummary {
    if (this.state.startedAt === null) {
      throw new Error('Cannot finalize before start');
    }

    if (!this.state.isFinalized) {
      this.state.isFinalized = true;

      if (!this.state.isInterrupted && this.state.lastEventTime !== null) {
        const delta = submittedAt - this.state.lastEventTime;
        this.state.wallClockMs += Math.max(0, delta);

        if (!this.state.isPaused && this.state.lastActiveTime !== null) {
          const activeDelta = submittedAt - this.state.lastActiveTime;
          this.state.activeMs += Math.max(0, activeDelta);
        }
      }

      if (this.state.idleStartTime !== null) {
        const idleDelta = submittedAt - this.state.idleStartTime;
        this.state.idleMs += idleDelta;
        if (idleDelta > this.state.longestIdleMs) {
          this.state.longestIdleMs = idleDelta;
        }
      }

      this.recalculateConfidence();
    }

    return {
      startedAt: new Date(this.state.startedAt).toISOString(),
      submittedAt: new Date(submittedAt).toISOString(),
      wallClockMs: this.state.wallClockMs,
      activeMs: this.state.activeMs,
      idleMs: this.state.idleMs,
      pauseCount: this.state.pauseCount,
      focusLossCount: this.state.focusLossCount,
      visibilityHiddenCount: this.state.visibilityHiddenCount,
      longestIdleMs: this.state.longestIdleMs ?? undefined,
      confidence: this.state.confidence,
      confidenceReasons:
        this.state.confidenceReasons.length > 0
          ? this.state.confidenceReasons
          : undefined,
    };
  }

  reset(): void {
    this.state = this.createInitialState();
  }
}

export function createTimingAccumulator(
  options: TimingAccumulatorOptions = {},
): TimingAccumulator {
  return new TimingAccumulator(options);
}