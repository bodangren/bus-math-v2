'use client';

import { Circle, CircleDot, Check, Lock } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { PhaseStatus } from '@/hooks/usePhaseProgress';

export interface StepperPhase {
  phaseNumber: number;
  phaseId: string;
  title: string;
  status: PhaseStatus;
}

interface LessonStepperProps {
  phases: StepperPhase[];
  currentPhase: number;
  onPhaseClick?: (phaseNumber: number, phaseId: string) => void;
  className?: string;
}

export function LessonStepper({
  phases,
  currentPhase,
  onPhaseClick,
  className,
}: LessonStepperProps) {
  const handlePhaseClick = (phase: StepperPhase) => {
    // Allow clicking on completed, current, or available phases
    if (phase.status === 'completed' || phase.status === 'current' || phase.status === 'available') {
      onPhaseClick?.(phase.phaseNumber, phase.phaseId);
    }
  };

  return (
    <nav
      role="navigation"
      aria-label="Lesson progress stepper"
      className={cn('w-full', className)}
    >
      {/* Desktop: Horizontal stepper */}
      <ol className="hidden md:flex items-center justify-between gap-2">
        {phases.map((phase, index) => (
          <li key={phase.phaseId} className="flex flex-1 items-center">
            <StepButton
              phase={phase}
              isCurrent={phase.phaseNumber === currentPhase}
              onClick={() => handlePhaseClick(phase)}
            />
            {index < phases.length - 1 && (
              <StepConnector completed={phase.status === 'completed'} />
            )}
          </li>
        ))}
      </ol>

      {/* Mobile: Compact horizontal scroll */}
      <ol className="flex md:hidden items-center gap-3 overflow-x-auto pb-2">
        {phases.map((phase) => (
          <li key={phase.phaseId} className="flex-shrink-0">
            <StepButton
              phase={phase}
              isCurrent={phase.phaseNumber === currentPhase}
              onClick={() => handlePhaseClick(phase)}
              compact
            />
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface StepButtonProps {
  phase: StepperPhase;
  isCurrent: boolean;
  onClick: () => void;
  compact?: boolean;
}

function StepButton({ phase, isCurrent, onClick, compact = false }: StepButtonProps) {
  const isClickable = phase.status === 'completed' || phase.status === 'current' || phase.status === 'available';
  const isLocked = phase.status === 'locked';

  const statusColors = {
    completed: 'bg-green-600 text-white border-green-600',
    current: 'bg-blue-600 text-white border-blue-600',
    available: 'bg-white text-gray-700 border-gray-300 hover:border-blue-400',
    locked: 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
  };

  const tooltipText = isLocked
    ? 'Complete previous phase to unlock'
    : phase.title;

  const StepIcon = () => {
    switch (phase.status) {
      case 'completed':
        return <Check className="h-4 w-4" aria-hidden="true" />;
      case 'current':
        return <CircleDot className="h-4 w-4" aria-hidden="true" />;
      case 'locked':
        return <Lock className="h-4 w-4" aria-hidden="true" />;
      default:
        return <Circle className="h-4 w-4" aria-hidden="true" />;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      aria-label={`Phase ${phase.phaseNumber}: ${phase.title}`}
      aria-current={isCurrent ? 'step' : undefined}
      title={tooltipText}
      className={cn(
        'flex items-center justify-center rounded-full border-2 transition-all',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        compact ? 'h-10 w-10' : 'h-12 w-12',
        statusColors[phase.status],
        isClickable && !isLocked && 'hover:scale-110',
      )}
    >
      {compact ? (
        <span className="text-sm font-semibold">{phase.phaseNumber}</span>
      ) : (
        <span className="sr-only">Phase {phase.phaseNumber}</span>
      )}
      {!compact && <StepIcon />}
    </button>
  );
}

interface StepConnectorProps {
  completed: boolean;
}

function StepConnector({ completed }: StepConnectorProps) {
  return (
    <div
      className={cn(
        'h-0.5 flex-1 transition-colors',
        completed ? 'bg-green-600' : 'bg-gray-300',
      )}
      aria-hidden="true"
    />
  );
}
