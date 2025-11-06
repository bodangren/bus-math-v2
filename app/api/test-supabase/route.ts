/**
 * Test Supabase Client Connection
 * Verifies we can connect to Supabase database using the Supabase client
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase credentials',
      }, { status: 500 });
    }

    // Create a Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try a simple SQL query that doesn't depend on any tables
    const { data, error } = await supabase.rpc('version');

    // If the function doesn't exist, try a direct query
    if (error) {
      // Try using the SQL editor approach
      const result = await supabase.from('pg_catalog.pg_tables')
        .select('tablename')
        .limit(1);

      if (result.error) {
        return NextResponse.json({
          success: false,
          error: result.error.message,
          code: result.error.code,
        }, { status: 500 });
      }
    }

    // If we got here, connection works
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      connectionType: 'Supabase Client with Service Role',
      data: data || 'Connected',
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
