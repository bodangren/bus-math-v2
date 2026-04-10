/**
 * Unit competency heatmap tests — Drill-Down and Context (Phase 3)
 * 
 * These tests verify unit-scoped competency filtering and drill-down behavior.
 */

import { describe, expect, it } from 'vitest';
import {
  assembleCompetencyHeatmapRows,
  assembleStudentCompetencyDetail,
  type RawCHStudent,
  type RawCHStandard,
  type RawCHCompetency,
  type RawCHLessonStandard,
  type RawCHLessonVersion,
  type RawCHLesson,
} from '@/lib/teacher/competency-heatmap';

describe('unit competency heatmap drill-down', () => {
  describe('filter by unit standards', () => {
    it('filters heatmap rows to only include standards from specified unit', () => {
      const mockStudents: RawCHStudent[] = [
        { id: 'student1', username: 'alice', displayName: 'Alice Smith' },
      ];

      const mockStandards: RawCHStandard[] = [
        { id: 'std1', code: 'ACC-1.1', description: 'Unit 1 standard', studentFriendlyDescription: 'Unit 1', category: 'Unit 1', isActive: true },
        { id: 'std2' as never, code: 'ACC-2.1', description: 'Unit 2 standard', studentFriendlyDescription: 'Unit 2', category: 'Unit 2', isActive: true },
        { id: 'std3', code: 'ACC-3.1', description: 'Unit 3 standard', studentFriendlyDescription: 'Unit 3', category: 'Unit 3', isActive: true },
      ];

      const mockCompetencyRows: RawCHCompetency[] = [
        { studentId: 'student1', standardId: 'std1', masteryLevel: 90, evidenceActivityId: 'act1', lastUpdated: 1234567890000, updatedBy: 'teacher1' },
        { studentId: 'student1', standardId: 'std2' as never, masteryLevel: 75, evidenceActivityId: 'act2', lastUpdated: 1234567890000, updatedBy: 'teacher1' },
        { studentId: 'student1', standardId: 'std3', masteryLevel: 60, evidenceActivityId: 'act3', lastUpdated: 1234567890000, updatedBy: 'teacher1' },
      ];

      const allStandardsResult = assembleCompetencyHeatmapRows(mockStudents, mockStandards, mockCompetencyRows);
      expect(allStandardsResult.standards).length(3);

      const unitStandards = [mockStandards[0], mockStandards[2]];
      const unitStandardsResult = assembleCompetencyHeatmapRows(mockStudents, unitStandards, mockCompetencyRows);

      expect(unitStandardsResult.standards).length(2);
      expect(unitStandardsResult.standards[0].code).toBe('ACC-1.1');
      expect(unitStandardsResult.standards[1].code).toBe('ACC-3.1');

      expect(unitStandardsResult.rows[0].cells).length(2);
      expect(unitStandardsResult.rows[0].cells[0].standardId).toBe('std1');
      expect(unitStandardsResult.rows[0].cells[1].standardId).toBe('std3');
      expect(unitStandardsResult.rows[0].cells[0].masteryLevel).toBe(90);
      expect(unitStandardsResult.rows[0].cells[1].masteryLevel).toBe(60);
    });

    it('returns empty standards array when unit has no standards', () => {
      const mockStudents: RawCHStudent[] = [
        { id: 'student1', username: 'alice', displayName: 'Alice Smith' },
      ];

      const mockStandards: RawCHStandard[] = [];
      const mockCompetencyRows: RawCHCompetency[] = [];

      const result = assembleCompetencyHeatmapRows(mockStudents, mockStandards, mockCompetencyRows);

      expect(result.standards).length(0);
      expect(result.rows).length(1);
      expect(result.rows[0].cells).length(0);
    });
  });

  describe('student competency detail drill-down', () => {
    it('assembles student detail with lesson context and evidence links', () => {
      const mockStudent: RawCHStudent = {
        id: 'student1',
        username: 'alice',
        displayName: 'Alice Smith',
      };

      const mockStandards: RawCHStandard[] = [
        { id: 'std1', code: 'ACC-1.1', description: 'Classify accounts', studentFriendlyDescription: 'Sort accounts', category: 'Classification', isActive: true },
        { id: 'std2', code: 'ACC-1.2', description: 'Record transactions', studentFriendlyDescription: 'Record transactions', category: 'Transactions', isActive: true },
      ];

      const mockCompetencyRows: RawCHCompetency[] = [
        { studentId: 'student1', standardId: 'std1', masteryLevel: 90, evidenceActivityId: 'act1', lastUpdated: 1234567890000, updatedBy: 'teacher1' },
        { studentId: 'student1', standardId: 'std2', masteryLevel: 75, evidenceActivityId: null, lastUpdated: 1234567890000, updatedBy: 'teacher1' },
      ];

      const mockLessonVersions: RawCHLessonVersion[] = [
        { id: 'lv1', lessonId: 'lesson1' },
      ];

      const mockLessons: RawCHLesson[] = [
        { id: 'lesson1', unitNumber: 1, title: 'Introduction to Accounting' },
      ];

      const mockLessonStandards: RawCHLessonStandard[] = [
        { standardId: 'std1', lessonVersionId: 'lv1', isPrimary: true },
      ];

      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );

      expect(result.studentId).toBe('student1');
      expect(result.displayName).toBe('Alice Smith');
      expect(result.competencies).length(2);

      const std1Competency = result.competencies[0];
      expect(std1Competency.standardId).toBe('std1');
      expect(std1Competency.masteryLevel).toBe(90);
      expect(std1Competency.evidenceActivityId).toBe('act1');
      expect(std1Competency.unitNumber).toBe(1);
      expect(std1Competency.lessonTitle).toBe('Introduction to Accounting');

      const std2Competency = result.competencies[1];
      expect(std2Competency.standardId).toBe('std2');
      expect(std2Competency.masteryLevel).toBe(75);
      expect(std2Competency.evidenceActivityId).toBe(null);
      expect(std2Competency.unitNumber).toBe(null);
      expect(std2Competency.lessonTitle).toBe(null);
    });

    it('handles missing lesson context gracefully', () => {

      const mockStudent: RawCHStudent = {
        id: 'student1',
        username: 'alice',
        displayName: 'Alice Smith',
      };

      const mockStandards: RawCHStandard[] = [
        { id: 'std1', code: 'ACC-1.1', description: 'Classify accounts', studentFriendlyDescription: 'Sort accounts', category: 'Classification', isActive: true },
      ];

      const mockCompetencyRows: RawCHCompetency[] = [
        { studentId: 'student1', standardId: 'std1', masteryLevel: 85, evidenceActivityId: 'act1', lastUpdated: 1234567890000, updatedBy: 'teacher1' },
      ];

      const mockLessonVersions: RawCHLessonVersion[] = [];
      const mockLessons: RawCHLesson[] = [];
      const mockLessonStandards: RawCHLessonStandard[] = [];

      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );

      expect(result.competencies).length(1);
      expect(result.competencies[0].unitNumber).toBe(null);
      expect(result.competencies[0].lessonTitle).toBe(null);
      expect(result.competencies[0].masteryLevel).toBe(85);
    });
  });
});
