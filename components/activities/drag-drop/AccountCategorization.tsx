'use client';

import { useCallback, useMemo } from 'react';

import { CategorizationList } from '@/components/activities/shared';
import type { Activity } from '@/lib/db/schema/validators';
import { type AccountCategorizationActivityProps } from '@/types/activities';
import {
  CATEGORIZATION_SUPPORTED_MODES,
  buildCategorizationPracticeSubmission,
} from './practiceSubmission';

export type AccountCategorizationActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'account-categorization';
  props: AccountCategorizationActivityProps;
};

export const ACCOUNT_CATEGORIZATION_SUPPORTED_MODES = CATEGORIZATION_SUPPORTED_MODES;

interface AccountCategorizationProps {
  activity: AccountCategorizationActivity;
  onSubmit?: (payload: import('@/lib/practice/contract').PracticeSubmissionCallbackPayload) => void;
}

type AccountItem = AccountCategorizationActivityProps['accounts'][number] & {
  label: string;
  description?: string;
  details?: Record<string, unknown>;
  targetId: string;
};

export function AccountCategorization({ activity, onSubmit }: AccountCategorizationProps) {
  const practiceMode = activity.props.showHintsByDefault ? 'guided_practice' : 'independent_practice';

  const categories = activity.props.categories;
  const items = useMemo<AccountItem[]>(
    () =>
      activity.props.accounts.map((account) => ({
        ...account,
        label: account.name,
        description: account.description,
        targetId: account.categoryId,
      })),
    [activity.props.accounts],
  );

  const handleCompletion = useCallback(
    ({ score, attempts, placements }: { score: number; attempts: number; placements: Record<string, AccountItem[]> }) => {
      onSubmit?.({
        ...buildCategorizationPracticeSubmission({
          activityId: activity.id,
          mode: practiceMode,
          attemptNumber: attempts,
          completedAt: new Date(),
          family: activity.componentKey,
          artifactKind: 'account_categorization_board',
          items,
          placements,
          zones: categories.map((category) => ({
            id: category.id,
            label: category.name,
            description: category.description,
          })),
          describeItem: (item) => ({
            label: item.label,
            description: item.description,
            details: {
              realWorldExample: item.realWorldExample ?? null,
              hint: item.hint ?? null,
            },
          }),
          analytics: {
            score,
            attempts,
            showHintsEnabled: activity.props.showHintsByDefault,
          },
        }),
      });
    },
    [activity.componentKey, activity.id, categories, items, onSubmit, practiceMode, activity.props.showHintsByDefault],
  );

  return (
    <CategorizationList
      title={activity.props.title}
      description={activity.props.description ?? activity.description}
      items={items}
      zones={categories.map((category) => ({
        id: category.id,
        label: category.name,
        description: category.description,
        whyItMatters: category.whyItMatters,
        emoji: category.emoji,
      }))}
      mode={practiceMode}
      shuffleItems={activity.props.shuffleItems}
      resetKey={activity.id}
      onComplete={handleCompletion}
      describeItem={(item) => ({
        label: item.label,
        description: item.description,
        details: {
          realWorldExample: item.realWorldExample ?? null,
          hint: item.hint ?? null,
        },
      })}
    />
  );
}
