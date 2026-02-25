import { describe, it, expect } from 'vitest';
import schema from '../../convex/schema';

describe('Convex Schema Translation', () => {
  it('should export a valid convex schema with all 21 tables', () => {
    // Convex's defineSchema returns a schema object with a tables property
    expect(schema).toBeDefined();
    
    // Verify all 21 tables are present
    const tableNames = Object.keys(schema.tables);
    expect(tableNames.length).toBe(21);
    
    // Check some specific core tables
    expect(tableNames).toContain('organizations');
    expect(tableNames).toContain('profiles');
    expect(tableNames).toContain('lessons');
    expect(tableNames).toContain('activities');
    expect(tableNames).toContain('student_progress');
    expect(tableNames).toContain('competency_standards');
  });
});
