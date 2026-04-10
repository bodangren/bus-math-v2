import { describe, it, expect } from 'vitest';
import schema from '../../convex/schema';

describe('Convex Schema Translation', () => {
  it('should export a valid convex schema with all expected tables', () => {
    // Convex's defineSchema returns a schema object with a tables property
    expect(schema).toBeDefined();
    
    // Verify table count after auth_credentials addition
    const tableNames = Object.keys(schema.tables);
    expect(tableNames.length).toBe(23);
    
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
