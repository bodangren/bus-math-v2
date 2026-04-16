import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GraphingExplorer } from '@/components/activities/graphing/GraphingExplorer';

describe('GraphingExplorer', () => {
  const defaultProps = {
    activityId: 'test-activity',
    mode: 'practice' as const,
    equation: 'y = x^2 + 2x + 1',
  };

  describe('hasRealIntercepts with canonical parsers', () => {
    it('shows no-intercepts warning for quadratic with negative discriminant', () => {
      render(
        <GraphingExplorer
          {...defaultProps}
          variant="find_intercepts"
          equation="y = x^2 + 0x + 5"
        />
      );
      expect(screen.getByText(/no real x-intercepts/i)).toBeInTheDocument();
    });

    it('does not show warning for quadratic with positive discriminant', () => {
      render(
        <GraphingExplorer
          {...defaultProps}
          variant="find_intercepts"
          equation="y = x^2 + 2x - 3"
        />
      );
      expect(screen.queryByText(/no real x-intercepts/i)).not.toBeInTheDocument();
    });

    it('preserves zero coefficient correctly (a=0 means not quadratic, no warning)', () => {
      render(
        <GraphingExplorer
          {...defaultProps}
          variant="find_intercepts"
          equation="y = 0x^2 + 5x + 10"
        />
      );
      expect(screen.queryByText(/no real x-intercepts/i)).not.toBeInTheDocument();
    });
  });

  describe('hasRealIntersections with canonical parsers', () => {
    it('shows no-intersections warning when curves do not intersect', () => {
      render(
        <GraphingExplorer
          {...defaultProps}
          variant="graph_system"
          equation="y = x^2 + 0x + 5"
          linearEquation="y = x"
        />
      );
      expect(screen.getByText(/no real intersection points/i)).toBeInTheDocument();
    });

    it('does not show warning when curves intersect', () => {
      render(
        <GraphingExplorer
          {...defaultProps}
          variant="graph_system"
          equation="y = x^2 - 2x - 3"
          linearEquation="y = x"
        />
      );
      expect(screen.queryByText(/no real intersection points/i)).not.toBeInTheDocument();
    });

    it('handles linear equation without y= prefix', () => {
      render(
        <GraphingExplorer
          {...defaultProps}
          variant="graph_system"
          equation="y = x^2 - 2x - 3"
          linearEquation="2x + 1"
        />
      );
      expect(screen.queryByText(/no real intersection points/i)).not.toBeInTheDocument();
    });

    it('handles constant linear equation', () => {
      render(
        <GraphingExplorer
          {...defaultProps}
          variant="graph_system"
          equation="y = x^2 - 4"
          linearEquation="y = 5"
        />
      );
      expect(screen.queryByText(/no real intersection points/i)).not.toBeInTheDocument();
    });
  });
});
