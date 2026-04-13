import { describe, it, expect } from 'vitest';
import schema from '../../convex/schema';

describe('Convex Schema Translation', () => {
  it('should export a valid convex schema with all expected tables', () => {
    // Convex's defineSchema returns a schema object with a tables property
    expect(schema).toBeDefined();
    
    // Verify table count after study tables addition
    const tableNames = Object.keys(schema.tables);
    expect(tableNames.length).toBe(30);
    
    // Check study tables
    expect(tableNames).toContain('study_preferences');
    expect(tableNames).toContain('term_mastery');
    expect(tableNames).toContain('due_reviews');
    expect(tableNames).toContain('study_sessions');
    expect(tableNames).toContain('practice_test_results');
    
    // Check component approval tables
    expect(tableNames).toContain('componentApprovals');
    expect(tableNames).toContain('componentReviews');
    
    // Check some specific core tables
    expect(tableNames).toContain('organizations');
    expect(tableNames).toContain('profiles');
    expect(tableNames).toContain('lessons');
    expect(tableNames).toContain('activities');
    expect(tableNames).toContain('student_progress');
    expect(tableNames).toContain('competency_standards');
    expect(tableNames).toContain('auth_credentials');
  });
});
