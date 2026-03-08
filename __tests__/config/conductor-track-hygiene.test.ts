import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Conductor track hygiene', () => {
  it('does not keep the same track id in both active and archived directories', () => {
    const tracksDir = path.resolve(process.cwd(), 'conductor/tracks');
    const archiveDir = path.resolve(process.cwd(), 'conductor/archive');

    const activeTrackIds = new Set(
      fs.readdirSync(tracksDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name),
    );

    const duplicateArchivedTrackIds = fs.readdirSync(archiveDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((trackId) => activeTrackIds.has(trackId));

    expect(duplicateArchivedTrackIds).toEqual([]);
  });
});
