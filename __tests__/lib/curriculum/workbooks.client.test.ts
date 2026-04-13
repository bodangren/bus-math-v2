import { describe, it, expect } from 'vitest';
import {
  lessonHasWorkbooks,
  hasStudentWorkbook,
  hasTeacherWorkbook,
  getWorkbookPath,
  hasCapstoneStudentWorkbook,
  hasCapstoneTeacherWorkbook,
  getCapstoneWorkbookPath,
} from '@/lib/curriculum/workbooks.client';

describe('workbooks.client', () => {
  describe('lessonHasWorkbooks', () => {
    it('returns true for lessons 4-7 across all 8 units', () => {
      for (let unit = 1; unit <= 8; unit++) {
        for (const lesson of [4, 5, 6, 7]) {
          expect(lessonHasWorkbooks(unit, lesson)).toBe(true);
        }
      }
    });

    it('returns false for lessons without workbooks', () => {
      expect(lessonHasWorkbooks(1, 1)).toBe(false);
      expect(lessonHasWorkbooks(1, 2)).toBe(false);
      expect(lessonHasWorkbooks(1, 3)).toBe(false);
      expect(lessonHasWorkbooks(1, 8)).toBe(false);
      expect(lessonHasWorkbooks(1, 11)).toBe(false);
      expect(lessonHasWorkbooks(8, 1)).toBe(false);
      expect(lessonHasWorkbooks(8, 8)).toBe(false);
    });

    it('handles unknown unit/lesson gracefully', () => {
      expect(lessonHasWorkbooks(99, 99)).toBe(false);
      expect(lessonHasWorkbooks(0, 0)).toBe(false);
    });
  });

  describe('hasStudentWorkbook', () => {
    it('returns true for lessons with student workbooks', () => {
      expect(hasStudentWorkbook(1, 4)).toBe(true);
      expect(hasStudentWorkbook(5, 7)).toBe(true);
      expect(hasStudentWorkbook(8, 4)).toBe(true);
    });

    it('returns false for lessons without student workbooks', () => {
      expect(hasStudentWorkbook(1, 1)).toBe(false);
      expect(hasStudentWorkbook(8, 8)).toBe(false);
    });
  });

  describe('hasTeacherWorkbook', () => {
    it('returns true for lessons with teacher workbooks', () => {
      expect(hasTeacherWorkbook(1, 4)).toBe(true);
      expect(hasTeacherWorkbook(5, 7)).toBe(true);
      expect(hasTeacherWorkbook(8, 4)).toBe(true);
    });

    it('returns false for lessons without teacher workbooks', () => {
      expect(hasTeacherWorkbook(1, 1)).toBe(false);
      expect(hasTeacherWorkbook(8, 8)).toBe(false);
    });
  });

  describe('getWorkbookPath', () => {
    it('returns correct path for student workbook', () => {
      expect(getWorkbookPath(1, 4, 'student')).toBe('/workbooks/unit_01_lesson_04_student.xlsx');
      expect(getWorkbookPath(8, 7, 'student')).toBe('/workbooks/unit_08_lesson_07_student.xlsx');
    });

    it('returns correct path for teacher workbook', () => {
      expect(getWorkbookPath(1, 4, 'teacher')).toBe('/workbooks/unit_01_lesson_04_teacher.xlsx');
      expect(getWorkbookPath(8, 7, 'teacher')).toBe('/workbooks/unit_08_lesson_07_teacher.xlsx');
    });

    it('pads unit and lesson numbers correctly', () => {
      expect(getWorkbookPath(1, 4, 'student')).toBe('/workbooks/unit_01_lesson_04_student.xlsx');
      expect(getWorkbookPath(10, 12, 'teacher')).toBe('/workbooks/unit_10_lesson_12_teacher.xlsx');
    });
  });

  describe('hasCapstoneStudentWorkbook', () => {
    it('returns true when capstone student workbook exists', () => {
      expect(hasCapstoneStudentWorkbook()).toBe(true);
    });
  });

  describe('hasCapstoneTeacherWorkbook', () => {
    it('returns true when capstone teacher workbook exists', () => {
      expect(hasCapstoneTeacherWorkbook()).toBe(true);
    });
  });

  describe('getCapstoneWorkbookPath', () => {
    it('returns correct path for student capstone workbook', () => {
      expect(getCapstoneWorkbookPath('student')).toBe('/workbooks/capstone_investor_ready_workbook.xlsx');
    });

    it('returns correct path for teacher capstone workbook', () => {
      expect(getCapstoneWorkbookPath('teacher')).toBe('/workbooks/capstone_investor_ready_workbook_teacher.xlsx');
    });
  });
});