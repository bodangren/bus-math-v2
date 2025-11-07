import { type LessonMetadata, type UnitContent } from '@/lib/db/schema/lessons';
import { cn } from '@/lib/utils';

import { AssessmentOverview } from './AssessmentOverview';
import { DrivingQuestion } from './DrivingQuestion';
import { LearningSequence } from './LearningSequence';
import { Prerequisites } from './Prerequisites';
import { StudentChoices } from './StudentChoices';
import { UnitHeader } from './UnitHeader';
import { UnitOverview } from './UnitOverview';

export interface UnitTemplateProps {
  unitNumber: number;
  title: string;
  description?: string | null;
  durationLabel?: string | null;
  durationMinutes?: number | null;
  difficulty?: LessonMetadata['difficulty'];
  unitContent: UnitContent;
  className?: string;
}

export function UnitTemplate({
  unitNumber,
  title,
  description,
  durationLabel,
  durationMinutes,
  difficulty,
  unitContent,
  className
}: UnitTemplateProps) {
  return (
    <div className={cn('space-y-12', className)}>
      <UnitHeader
        unitNumber={unitNumber}
        title={title}
        description={description}
        durationLabel={durationLabel}
        durationMinutes={durationMinutes}
        difficulty={difficulty}
      />

      <UnitOverview objectives={unitContent.objectives} />

      <DrivingQuestion drivingQuestion={unitContent.drivingQuestion} />

      <AssessmentOverview assessment={unitContent.assessment} />

      <LearningSequence learningSequence={unitContent.learningSequence} />

      <StudentChoices studentChoices={unitContent.studentChoices} />

      <Prerequisites
        prerequisites={unitContent.prerequisites}
        differentiation={unitContent.differentiation}
      />
    </div>
  );
}
