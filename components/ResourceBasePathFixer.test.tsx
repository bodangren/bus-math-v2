import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ResourceBasePathFixer } from './ResourceBasePathFixer';

const appendResourceLink = (href: string) => {
  const anchor = document.createElement('a');
  anchor.setAttribute('href', href);
  document.body.appendChild(anchor);
  return anchor;
};

describe('ResourceBasePathFixer', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    document.body.innerHTML = '';
    process.env.NODE_ENV = originalEnv;
  });

  it('prefixes resource links in production builds', async () => {
    const anchor = appendResourceLink('/resources/data.csv');
    process.env.NODE_ENV = 'production';

    render(<ResourceBasePathFixer />);

    await waitFor(() => {
      expect(anchor.getAttribute('href')).toBe('/Business-Operations/resources/data.csv');
    });
  });

  it('keeps resource links untouched outside production', async () => {
    const anchor = appendResourceLink('/resources/data.csv');
    process.env.NODE_ENV = 'development';

    render(<ResourceBasePathFixer />);

    await waitFor(() => {
      expect(anchor.getAttribute('href')).toBe('/resources/data.csv');
    });
  });
});
