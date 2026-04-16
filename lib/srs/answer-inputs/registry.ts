import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import type { ProblemFamily } from '@/lib/practice/engine/types';
import { AccountingEquationInput } from '@/components/student/answer-inputs/AccountingEquationInput';
import { NormalBalanceInput } from '@/components/student/answer-inputs/NormalBalanceInput';

export interface DailyPracticeAnswerInputProps {
  family: ProblemFamily<unknown, unknown, unknown>;
  definition: unknown;
  onSubmit: (envelope: PracticeSubmissionEnvelope) => void;
}

export type DailyPracticeAnswerInputComponent = React.ComponentType<DailyPracticeAnswerInputProps>;

export const dailyPracticeInputRegistry: Record<string, DailyPracticeAnswerInputComponent> = {
  'accounting-equation': AccountingEquationInput,
  'normal-balance': NormalBalanceInput,
};
