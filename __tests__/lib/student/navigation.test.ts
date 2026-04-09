import {
  studentDashboardPath,
  teacherDashboardPath,
  getRoleAwareDashboardPath,
  studentUnitAnchor,
  studentLessonPath,
  studentLessonPhasePath,
} from '@/lib/student/navigation';

describe('student navigation helpers', () => {
  describe('studentDashboardPath', () => {
    it('returns correct student dashboard path', () => {
      expect(studentDashboardPath()).toBe('/student/dashboard');
    });
  });

  describe('teacherDashboardPath', () => {
    it('returns correct teacher dashboard path', () => {
      expect(teacherDashboardPath()).toBe('/teacher/dashboard');
    });
  });

  describe('getRoleAwareDashboardPath', () => {
    it('returns student dashboard for student role', () => {
      expect(getRoleAwareDashboardPath('student')).toBe('/student/dashboard');
    });

    it('returns teacher dashboard for teacher role', () => {
      expect(getRoleAwareDashboardPath('teacher')).toBe('/teacher/dashboard');
    });

    it('returns teacher dashboard for admin role', () => {
      expect(getRoleAwareDashboardPath('admin')).toBe('/teacher/dashboard');
    });

    it('returns teacher dashboard for undefined role', () => {
      expect(getRoleAwareDashboardPath(undefined)).toBe('/teacher/dashboard');
    });
  });

  describe('studentUnitAnchor', () => {
    it('returns anchor to unit section on student dashboard', () => {
      expect(studentUnitAnchor(1)).toBe('/student/dashboard#unit-1');
      expect(studentUnitAnchor(3)).toBe('/student/dashboard#unit-3');
      expect(studentUnitAnchor(8)).toBe('/student/dashboard#unit-8');
    });

    it('uses studentDashboardPath as base', () => {
      const dashboardPath = studentDashboardPath();
      const unitPath = studentUnitAnchor(5);
      expect(unitPath).toContain(dashboardPath);
      expect(unitPath).toContain('#unit-5');
    });
  });

  describe('studentLessonPath', () => {
    it('returns correct student lesson path', () => {
      expect(studentLessonPath('introduction-to-accounting')).toBe(
        '/student/lesson/introduction-to-accounting',
      );
      expect(studentLessonPath('unit01-lesson01')).toBe('/student/lesson/unit01-lesson01');
    });

    it('handles lesson slugs with hyphens', () => {
      expect(studentLessonPath('financial-statements-overview')).toBe(
        '/student/lesson/financial-statements-overview',
      );
    });
  });

  describe('studentLessonPhasePath', () => {
    it('returns correct student lesson phase path', () => {
      expect(studentLessonPhasePath('introduction-to-accounting', 1)).toBe(
        '/student/lesson/introduction-to-accounting?phase=1',
      );
      expect(studentLessonPhasePath('unit01-lesson01', 3)).toBe(
        '/student/lesson/unit01-lesson01?phase=3',
      );
    });

    it('uses studentLessonPath as base', () => {
      const lessonSlug = 'introduction-to-accounting';
      const lessonPath = studentLessonPath(lessonSlug);
      const phasePath = studentLessonPhasePath(lessonSlug, 2);
      expect(phasePath).toContain(lessonPath);
      expect(phasePath).toContain('?phase=2');
    });
  });
});
