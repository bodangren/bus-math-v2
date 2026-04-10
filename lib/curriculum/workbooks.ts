'use server';

import path from 'path';
import * as fs from 'fs';

export function getWorkbookPath(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): string {
  const unitStr = String(unitNumber).padStart(2, '0');
  const lessonStr = String(lessonNumber).padStart(2, '0');
  return `/workbooks/unit_${unitStr}_lesson_${lessonStr}_${type}.xlsx`;
}

export function workbookExists(unitNumber: number, lessonNumber: number, type: 'student' | 'teacher'): boolean {
  const publicPath = path.join(process.cwd(), 'public', getWorkbookPath(unitNumber, lessonNumber, type));
  return fs.existsSync(publicPath);
}

export function lessonHasWorkbooks(unitNumber: number, lessonNumber: number): boolean {
  return workbookExists(unitNumber, lessonNumber, 'student') || workbookExists(unitNumber, lessonNumber, 'teacher');
}
