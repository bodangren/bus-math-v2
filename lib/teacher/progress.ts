const percentageFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function clampTeacherProgressPercentage(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

export function formatTeacherProgressPercentage(value: number) {
  return `${percentageFormatter.format(clampTeacherProgressPercentage(value))}%`;
}

export function formatTeacherLastActive(value: string | null) {
  if (!value) {
    return 'No activity recorded';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'No activity recorded';
  }

  return dateTimeFormatter.format(parsed);
}

export function formatTeacherLastActiveDate(value: string | null) {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toISOString().split('T')[0];
}
