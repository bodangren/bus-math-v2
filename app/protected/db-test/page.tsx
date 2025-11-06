/**
 * Database Connection Test Page
 *
 * Temporary page to verify Drizzle ORM connection works.
 * Can be deleted after Issue #3 is complete.
 */

import { testDatabaseConnection } from '@/lib/db/test-connection';
import { CheckCircle2, XCircle, Database } from 'lucide-react';

export default async function DatabaseTestPage() {
  const result = await testDatabaseConnection();

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Drizzle ORM Connection Test</h1>
        <p className="text-muted-foreground">
          Testing database connection via Supabase transaction pooler
        </p>
      </div>

      <div
        className={`p-6 rounded-lg border-2 ${
          result.success
            ? 'bg-green-50 border-green-500 dark:bg-green-950'
            : 'bg-red-50 border-red-500 dark:bg-red-950'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          {result.success ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          )}
          <h2 className="text-xl font-semibold">
            {result.success ? 'Connection Successful' : 'Connection Failed'}
          </h2>
        </div>

        <p className="mb-4">{result.message}</p>

        {result.success && result.data && (
          <div className="space-y-2 bg-background/50 p-4 rounded">
            <div className="flex gap-2">
              <Database className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-mono text-sm">
                  <strong>Connection Type:</strong> {result.data.connectionType}
                </p>
                <p className="font-mono text-sm">
                  <strong>Current Time:</strong> {new Date(result.data.currentTime).toISOString()}
                </p>
                <p className="font-mono text-sm break-all">
                  <strong>PostgreSQL Version:</strong> {result.data.postgresVersion}
                </p>
              </div>
            </div>
          </div>
        )}

        {!result.success && (
          <div className="bg-background/50 p-4 rounded">
            <p className="font-mono text-sm text-red-600 dark:text-red-400">
              <strong>Error:</strong> {result.error}
            </p>
          </div>
        )}
      </div>

      <div className="bg-muted p-6 rounded-lg">
        <h3 className="font-semibold mb-3">Connection Details</h3>
        <ul className="space-y-2 text-sm">
          <li>✓ Using Drizzle ORM with postgres-js driver</li>
          <li>✓ Connected via Supabase transaction pooler (port 6543)</li>
          <li>✓ Connection pooling configured (max: 10 connections)</li>
          <li>✓ Prepared statements disabled for pooler compatibility</li>
        </ul>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>
          <strong>Issue:</strong> #3 - Set Up Drizzle ORM Infrastructure
        </p>
        <p>
          <strong>Test File:</strong> <code>lib/db/test-connection.ts</code>
        </p>
        <p>
          <strong>Note:</strong> This page can be deleted after verifying the connection works.
        </p>
      </div>
    </div>
  );
}
