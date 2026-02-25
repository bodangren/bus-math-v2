import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Middleware Migration', () => {
  it('should not have the legacy supabase middleware file', () => {
    const middlewarePath = path.resolve(process.cwd(), 'lib/supabase/middleware.ts');
    
    // The file should have been removed since it was unused and Supabase is being ripped out
    expect(fs.existsSync(middlewarePath)).toBe(false);
  });
});
