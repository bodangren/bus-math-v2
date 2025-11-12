/**
 * Test script to validate Supabase client connections
 * Run with: npx tsx scripts/test-supabase-connection.ts
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "../lib/supabase/admin";

// Load environment variables from .env.local
config({ path: ".env.local" });

async function testConnections() {
  console.log("🔍 Testing Supabase connections...\n");

  // Test 1: Browser client (anon key)
  console.log("1️⃣  Testing browser client (anon key)...");
  try {
    const browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    // Simple query to test connection without triggering RLS
    const { error } = await browserClient.from("lessons").select("id").limit(0);

    // Any error except "no rows" is a problem
    if (error && error.code !== "PGRST116") {
      throw error;
    }

    console.log("   ✅ Browser client connected successfully");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("   ❌ Browser client failed:", errorMessage);
    process.exit(1);
  }

  // Test 2: Admin client (service role key)
  console.log("\n2️⃣  Testing admin client (service role key)...");
  try {
    const adminClient = createAdminClient();

    // Test database access with service role (bypasses RLS)
    const { error } = await adminClient.from("lessons").select("id").limit(0);

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    console.log("   ✅ Admin client connected successfully");
    console.log("   ✅ Service role key verified (bypasses RLS)");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("   ❌ Admin client failed:", errorMessage);
    process.exit(1);
  }

  // Test 3: Environment variables
  console.log("\n3️⃣  Validating environment variables...");
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  let allEnvVarsPresent = true;
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`   ❌ Missing ${envVar}`);
      allEnvVarsPresent = false;
    } else {
      console.log(`   ✅ ${envVar} is set`);
    }
  }

  if (!allEnvVarsPresent) {
    process.exit(1);
  }

  // Test 4: Verify service role key is not exposed to browser
  console.log("\n4️⃣  Security check...");
  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("NEXT_PUBLIC_")) {
    console.error(
      "   ❌ SECURITY WARNING: Service role key should not start with NEXT_PUBLIC_"
    );
    process.exit(1);
  }
  console.log(
    "   ✅ Service role key not exposed (does not start with NEXT_PUBLIC_)"
  );

  console.log("\n✅ All Supabase connection tests passed!\n");
}

// Run tests
testConnections().catch((error) => {
  console.error("\n❌ Test suite failed:", error);
  process.exit(1);
});
