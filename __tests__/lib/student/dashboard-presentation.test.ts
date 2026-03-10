import { describe, expect, it } from 'vitest';

import {
  dashboardStatusBadgeClassName,
  dashboardStatusLabel,
} from '@/lib/student/dashboard-presentation';

describe('student dashboard presentation helpers', () => {
  it('maps status labels for unit progress badges', () => {
    expect(dashboardStatusLabel('completed')).toBe('Completed');
    expect(dashboardStatusLabel('in_progress')).toBe('In Progress');
    expect(dashboardStatusLabel('not_started')).toBe('Not Started');
  });

  it('returns stable semantic badge classes for each status', () => {
    expect(dashboardStatusBadgeClassName('completed')).toContain('emerald');
    expect(dashboardStatusBadgeClassName('in_progress')).toContain('sky');
    expect(dashboardStatusBadgeClassName('not_started')).toContain('amber');
  });
});
