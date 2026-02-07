import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ResourceBasePathFixer } from '../../components/ResourceBasePathFixer';

const appendResourceLink = (href: string) => {
  const anchor = document.createElement('a');
  anchor.setAttribute('href', href);
  document.body.appendChild(anchor);
  return anchor;
};

describe('ResourceBasePathFixer', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.unstubAllEnvs();
  });

  it('prefixes resource links in production builds', async () => {
    const anchor = appendResourceLink('/resources/data.csv');
    vi.stubEnv('NODE_ENV', 'production');

    render(<ResourceBasePathFixer />);

    await waitFor(() => {
      expect(anchor.getAttribute('href')).toBe('/Business-Operations/resources/data.csv');
    });
  });

  it('keeps resource links untouched outside production', async () => {
    const anchor = appendResourceLink('/resources/data.csv');
    vi.stubEnv('NODE_ENV', 'development');

    render(<ResourceBasePathFixer />);

    await waitFor(() => {
      expect(anchor.getAttribute('href')).toBe('/resources/data.csv');
    });
  });
});
