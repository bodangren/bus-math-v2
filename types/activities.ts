import type {
  ActivityComponentKey as SchemaActivityComponentKey,
  ActivityProps as SchemaActivityProps,
  GradingConfig as SchemaGradingConfig,
} from '@/lib/db/schema/activities';
import type { SubmissionData } from '@/lib/db/schema/activity-submissions';

export const ACTIVITY_SUBMISSION_REQUIRED_FIELDS = ['answers'] as const;

export type ActivityComponentKey = SchemaActivityComponentKey;
export type ActivityProps = SchemaActivityProps;
export type GradingConfig = SchemaGradingConfig;
export type ActivitySubmissionData = SubmissionData;
