import { Badge } from '@/components/ui/badge';
import { type LessonMetadata } from '@/lib/db/schema/lessons';
import { cn } from '@/lib/utils';
import { Clock, GraduationCap } from 'lucide-react';

export interface UnitHeaderProps {
  unitNumber: number;
  title: string;
  description?: string | null;
  durationLabel?: string | null;
  durationMinutes?: number | null;
  difficulty?: LessonMetadata['difficulty'];
  className?: string;
}

const difficultyConfig: Record<NonNullable<LessonMetadata['difficulty']>, { color: string; icon: string; label: string }> = {
  beginner: { color: 'bg-green-100 text-green-800', icon: '🟢', label: 'Beginner' },
  intermediate: { color: 'bg-yellow-100 text-yellow-800', icon: '🟡', label: 'Intermediate' },
  advanced: { color: 'bg-red-100 text-red-800', icon: '🔴', label: 'Advanced' }
};

const formatDuration = (durationLabel?: string | null, durationMinutes?: number | null) => {
  if (durationLabel) return durationLabel;
  if (typeof durationMinutes === 'number' && Number.isFinite(durationMinutes)) {
    return `${durationMinutes} min`;
  }
  return null;
};

export function UnitHeader({
  unitNumber,
  title,
  description,
  durationLabel,
  durationMinutes,
  difficulty,
  className
}: UnitHeaderProps) {
  const durationText = formatDuration(durationLabel, durationMinutes);
  const difficultyStyle = difficulty ? difficultyConfig[difficulty] : null;

  return (
    <header className={cn('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Badge variant="default" className="bg-primary text-primary-foreground px-3 py-1">
          {`Unit ${unitNumber}`}
        </Badge>

        {durationText ? (
          <div className="flex items-center gap-2 text-muted-foreground" aria-label="Estimated duration">
            <Clock className="h-4 w-4" />
            <span>{durationText}</span>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          <Badge
            variant="outline"
            className={difficultyStyle ? difficultyStyle.color : 'text-muted-foreground'}
          >
            {difficultyStyle ? `${difficultyStyle.icon} ${difficultyStyle.label}` : 'Skill level TBD'}
          </Badge>
        </div>
      </div>

      <h1 className="text-4xl font-bold tracking-tight">{title}</h1>

      {description ? (
        <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl">{description}</p>
      ) : null}
    </header>
  );
}
