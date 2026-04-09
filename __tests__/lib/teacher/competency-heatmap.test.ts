/**
 * Competency heatmap assembly tests - Competency Reporting Contract (Phase 1)
 * 
 * These tests verify the pure logic functions that transform raw DB rows into
 * the competency heatmap and student detail view models.
 */

import { describe, expect, it } from 'vitest';
import {
  assembleCompetencyHeatmapRows,
  assembleStudentCompetencyDetail,
  computeCompetencyColor,
  type CompetencyHeatmapRow,
  type CompetencyHeatmapCell,
  type CompetencyHeatmapResponse,
  type StudentCompetencyDetail,
  type StudentCompetency,
  type RawCHStudent,
  type RawCHStandard,
  type RawCHCompetency,
  type RawCHLessonStandard,
  type RawCHLessonVersion,
  type RawCHLesson,
} from '@/lib/teacher/competency-heatmap';

describe('competency heatmap assembly', () => {
  describe('computeCompetencyColor', () => {
    it('returns gray for null mastery level', () => {
      expect(computeCompetencyColor(null)).toBe('gray');
    });

    it('returns green for mastery >= 80', () => {
      expect(computeCompetencyColor(80)).toBe('green');
      expect(computeCompetencyColor(90)).toBe('green');
      expect(computeCompetencyColor(100)).toBe('green');
    });

    it('returns yellow for mastery 50-79', () => {
      expect(computeCompetencyColor(50)).toBe('yellow');
      expect(computeCompetencyColor(65)).toBe('yellow');
      expect(computeCompetencyColor(79)).toBe('yellow');
    });

    it('returns red for mastery < 50', () => {
      expect(computeCompetencyColor(0)).toBe('red');
      expect(computeCompetencyColor(25)).toBe('red');
      expect(computeCompetencyColor(49)).toBe('red');
    });
  });

  describe('assembleCompetencyHeatmapRows', () => {
    const mockStudents: RawCHStudent[] = [
      { id: 'student1', username: 'alice', displayName: 'Alice Smith' },
      { id: 'student2', username: 'bob', displayName: null },
    ];

    const mockStandards: RawCHStandard[] = [
      {
        id: 'std1',
        code: 'ACC-1.1',
        description: 'Classify accounts',
        studentFriendlyDescription: 'Sort accounts into categories',
        category: 'Classification',
        isActive: true,
      },
      {
        id: 'std2',
        code: 'ACC-1.2',
        description: 'Record transactions',
        studentFriendlyDescription: 'Record business transactions',
        category: 'Transactions',
        isActive: true,
      },
      {
        id: 'std3',
        code: 'ACC-1.3',
        description: 'Inactive standard',
        studentFriendlyDescription: null,
        category: null,
        isActive: false,
      },
    ];

    const mockCompetencyRows: RawCHCompetency[] = [
      {
        studentId: 'student1',
        standardId: 'std1',
        masteryLevel: 90,
        evidenceActivityId: 'act1',
        lastUpdated: 1234567890000,
        updatedBy: 'teacher1',
      },
      {
        studentId: 'student1',
        standardId: 'std2',
        masteryLevel: 45,
        evidenceActivityId: 'act2',
        lastUpdated: 1234567890000,
        updatedBy: 'teacher1',
      },
      {
        studentId: 'student2',
        standardId: 'std1',
        masteryLevel: 60,
        evidenceActivityId: null,
        lastUpdated: 1234567890000,
        updatedBy: null,
      },
    ];

    it('filters inactive standards', () => {
      const result = assembleCompetencyHeatmapRows(mockStudents, mockStandards, mockCompetencyRows);
      
      expect(result.standards).toHaveLength(2);
      expect(result.standards.map(s => s.id)).toEqual(['std1', 'std2']);
      expect(result.standards.map(s => s.code)).toEqual(['ACC-1.1', 'ACC-1.2']);
    });

    it('creates one row per student with all active standards as cells', () => {
      const result = assembleCompetencyHeatmapRows(mockStudents, mockStandards, mockCompetencyRows);
      
      expect(result.rows).toHaveLength(2);
      
      expect(result.rows[0].studentId).toBe('student1');
      expect(result.rows[0].displayName).toBe('Alice Smith');
      expect(result.rows[0].username).toBe('alice');
      expect(result.rows[0].cells).toHaveLength(2);
      
      expect(result.rows[1].studentId).toBe('student2');
      expect(result.rows[1].displayName).toBe('bob');
      expect(result.rows[1].username).toBe('bob');
      expect(result.rows[1].cells).toHaveLength(2);
    });

    it('populates cells with correct standard data and mastery levels', () => {
      const result = assembleCompetencyHeatmapRows(mockStudents, mockStandards, mockCompetencyRows);
      
      // Student 1, std1 (90 mastery)
      expect(result.rows[0].cells[0]).toEqual({
        standardId: 'std1',
        standardCode: 'ACC-1.1',
        standardDescription: 'Classify accounts',
        category: 'Classification',
        masteryLevel: 90,
        color: 'green',
      });
      
      // Student 1, std2 (45 mastery)
      expect(result.rows[0].cells[1]).toEqual({
        standardId: 'std2',
        standardCode: 'ACC-1.2',
        standardDescription: 'Record transactions',
        category: 'Transactions',
        masteryLevel: 45,
        color: 'red',
      });
      
      // Student 2, std1 (60 mastery)
      expect(result.rows[1].cells[0]).toEqual({
        standardId: 'std1',
        standardCode: 'ACC-1.1',
        standardDescription: 'Classify accounts',
        category: 'Classification',
        masteryLevel: 60,
        color: 'yellow',
      });
      
      // Student 2, std2 (no data)
      expect(result.rows[1].cells[1]).toEqual({
        standardId: 'std2',
        standardCode: 'ACC-1.2',
        standardDescription: 'Record transactions',
        category: 'Transactions',
        masteryLevel: null,
        color: 'gray',
      });
    });

    it('handles empty inputs gracefully', () => {
      const result = assembleCompetencyHeatmapRows([], [], []);
      
      expect(result.rows).toEqual([]);
      expect(result.standards).toEqual([]);
    });

    it('uses username as fallback when displayName is null', () => {
      const result = assembleCompetencyHeatmapRows(mockStudents, mockStandards, mockCompetencyRows);
      
      expect(result.rows[1].displayName).toBe('bob');
    });
  });

  describe('assembleStudentCompetencyDetail', () => {
    const mockStudent: RawCHStudent = {
      id: 'student1',
      username: 'alice',
      displayName: 'Alice Smith',
    };

    const mockStandards: RawCHStandard[] = [
      {
        id: 'std1',
        code: 'ACC-1.1',
        description: 'Classify accounts',
        studentFriendlyDescription: 'Sort accounts into categories',
        category: 'Classification',
        isActive: true,
      },
      {
        id: 'std2',
        code: 'ACC-1.2',
        description: 'Record transactions',
        studentFriendlyDescription: null,
        category: 'Transactions',
        isActive: true,
      },
    ];

    const mockCompetencyRows: RawCHCompetency[] = [
      {
        studentId: 'student1',
        standardId: 'std1',
        masteryLevel: 85,
        evidenceActivityId: 'act1',
        lastUpdated: 1234567890000,
        updatedBy: 'teacher1',
      },
      {
        studentId: 'other_student',
        standardId: 'std1',
        masteryLevel: 50,
        evidenceActivityId: null,
        lastUpdated: 1234567890000,
        updatedBy: null,
      },
    ];

    const mockLessonStandards: RawCHLessonStandard[] = [
      {
        standardId: 'std1',
        lessonVersionId: 'lv1',
        isPrimary: true,
      },
    ];

    const mockLessonVersions: RawCHLessonVersion[] = [
      {
        id: 'lv1',
        lessonId: 'lesson1',
      },
    ];

    const mockLessons: RawCHLesson[] = [
      {
        id: 'lesson1',
        unitNumber: 1,
        title: 'Lesson 1: Introduction to Accounting',
      },
    ];

    it('creates detail view for specified student only', () => {
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
      expect(result.username).toBe('alice');
    });

    it('populates competencies for all active standards', () => {
      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );
      
      expect(result.competencies).toHaveLength(2);
    });

    it('includes mastery data where available for the student', () => {
      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );
      
      const std1Competency = result.competencies.find(c => c.standardCode === 'ACC-1.1');
      expect(std1Competency).toBeDefined();
      expect(std1Competency?.masteryLevel).toBe(85);
      expect(std1Competency?.evidenceActivityId).toBe('act1');
      expect(std1Competency?.lastUpdated).toBe(1234567890000);
      expect(std1Competency?.updatedBy).toBe('teacher1');
    });

    it('fills null for missing competency data', () => {
      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );
      
      const std2Competency = result.competencies.find(c => c.standardCode === 'ACC-1.2');
      expect(std2Competency).toBeDefined();
      expect(std2Competency?.masteryLevel).toBe(null);
      expect(std2Competency?.evidenceActivityId).toBe(null);
      expect(std2Competency?.lastUpdated).toBe(null);
      expect(std2Competency?.updatedBy).toBe(null);
    });

    it('derives unit and lesson context from primary lesson standards', () => {
      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );
      
      const std1Competency = result.competencies.find(c => c.standardCode === 'ACC-1.1');
      expect(std1Competency?.unitNumber).toBe(1);
      expect(std1Competency?.lessonTitle).toBe('Lesson 1: Introduction to Accounting');
    });

    it('fills null for standards with no primary lesson context', () => {
      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );
      
      const std2Competency = result.competencies.find(c => c.standardCode === 'ACC-1.2');
      expect(std2Competency?.unitNumber).toBe(null);
      expect(std2Competency?.lessonTitle).toBe(null);
    });
  });
});
