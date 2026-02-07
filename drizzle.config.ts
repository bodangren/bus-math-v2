/**
 * Drizzle Kit Configuration (Query/Studio only)
 *
 * Supabase SQL migrations are the canonical schema source.
 * This config is intentionally limited and must not be used to generate app migrations.
 */

import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

if (!process.env.DIRECT_URL) {
  throw new Error(
    'DIRECT_URL is not defined in .env.local.\n' +
      'Please add it to use drizzle-kit tooling.\n' +
      'Format: postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres',
  );
}

const config = {
  // Database dialect
  dialect: 'postgresql',

  // Connection for non-migration tooling (e.g., local schema inspection)
  dbCredentials: {
    url: process.env.DIRECT_URL,
  },

  verbose: true,
  strict: true,
};

export default config;
