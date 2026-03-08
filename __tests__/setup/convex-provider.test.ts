import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('ConvexProvider Integration', () => {
  it('should wrap the root layout with a ConvexClientProvider', () => {
    const layoutPath = path.resolve(process.cwd(), 'app/layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // Check that we're importing and using a client-side provider
    expect(layoutContent).toContain('ConvexClientProvider');
    expect(layoutContent).toMatch(/<ConvexClientProvider[^>]*>/);
  });
  
  it('should have a ConvexClientProvider component', () => {
    const providerPath = path.resolve(process.cwd(), 'components/ConvexClientProvider.tsx');
    expect(fs.existsSync(providerPath)).toBe(true);
    
    const providerContent = fs.readFileSync(providerPath, 'utf8');
    expect(providerContent).toContain('"use client"');
    expect(providerContent).toContain('ConvexProvider');
    expect(providerContent).toContain('ConvexReactClient');
    expect(providerContent).toContain('getConvexUrl');
  });
});
