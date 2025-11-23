/**
 * Demo User Seeding Script
 *
 * Creates demo teacher and student accounts using the Supabase Auth Admin API.
 * This approach works on Supabase Cloud, unlike direct SQL inserts to auth.users.
 *
 * Prerequisites:
 * - Organization seed script (00-demo-org.sql) must be run first
 * - NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set
 *
 * Usage:
 *   npx tsx supabase/seed/01-demo-users.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const DEMO_ORG_ID = "00000000-0000-0000-0000-000000000001";

interface DemoUser {
  username: string;
  password: string;
  role: "teacher" | "student";
  displayName: string;
}

const demoUsers: DemoUser[] = [
  {
    username: "demo_teacher",
    password: "demo123",
    role: "teacher",
    displayName: "Demo Teacher",
  },
  {
    username: "demo_student",
    password: "demo123",
    role: "student",
    displayName: "Demo Student",
  },
];

async function seedDemoUsers() {
  console.log("🌱 Starting demo user seed...");

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not set. Please check your .env.local file."
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Please check your .env.local file."
    );
  }

  // Create admin client
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log("✅ Admin client created");

  // Process each demo user
  for (const user of demoUsers) {
    console.log(`\n👤 Processing ${user.username}...`);

    // 1. Check if user exists and clean up if necessary (optional, but safer for seeding)
    // For now, we'll just try to find them.
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(
        (u) => u.email === `${user.username}@internal.domain`
    );

    let userId = existingUser?.id;

    if (existingUser) {
        console.log(`⚠️  Auth user ${user.username} already exists (ID: ${userId}).`);
        // Optional: Delete and recreate to ensure clean state?
        // await supabase.auth.admin.deleteUser(existingUser.id);
        // userId = null;
    } else {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: `${user.username}@internal.domain`,
            password: user.password,
            email_confirm: true,
            user_metadata: { role: user.role },
        });

        if (authError) {
            console.error(`❌ Failed to create auth user ${user.username}: ${authError.message}`);
            continue;
        }
        userId = authData.user?.id;
        console.log(`✅ Auth user created: ${userId}`);
    }

    if (!userId) continue;

    // 2. Upsert profile
    // We use upsert to handle both new and existing cases
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        organization_id: DEMO_ORG_ID,
        username: user.username,
        role: user.role,
        display_name: user.displayName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error(
        `❌ Failed to upsert profile for ${user.username}: ${profileError.message}`
      );
    } else {
      console.log(`✅ Profile upserted for ${user.username}`);
    }
  }

  console.log("\n🎉 Demo user seed completed!");
  console.log("\nDemo Credentials:");
  console.log("─────────────────────────────────");
  console.log("Teacher: demo_teacher / demo123");
  console.log("Student: demo_student / demo123");
  console.log("─────────────────────────────────");
}

// Run the seed function
seedDemoUsers().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
