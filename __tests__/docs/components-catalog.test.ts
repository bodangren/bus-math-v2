import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { getActivityComponent } from '@/lib/activities/registry';

const repoRoot = path.resolve(__dirname, '..', '..');
const componentsCatalogPath = path.join(repoRoot, 'docs', 'components.yaml');

function readComponentKeysFromDocs(): string[] {
  return fs
    .readFileSync(componentsCatalogPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => line.match(/^([^:]+):/)?.[1]?.trim())
    .filter((key): key is string => Boolean(key));
}

describe('docs/components.yaml activity keys', () => {
  it('keeps the documented canonical keys resolvable by the runtime registry', () => {
    const documentedKeys = new Set(readComponentKeysFromDocs());

    const canonicalKeys = [
      'drag-and-drop',
      'journal-entry-building',
      'spreadsheet',
      'data-cleaning',
    ];

    canonicalKeys.forEach((key) => {
      expect(documentedKeys.has(key)).toBe(true);
      expect(getActivityComponent(key), `${key} should resolve through the runtime catalog`).not.toBeNull();
    });
  });
});
