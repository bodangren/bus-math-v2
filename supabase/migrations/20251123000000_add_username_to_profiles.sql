-- Add username column to profiles table (missed from Drizzle migration)
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "username" text;

-- Update existing profiles to have a temporary username to satisfy NOT NULL constraint
UPDATE "profiles" 
SET "username" = 'user_' || substring(id::text, 1, 8) 
WHERE "username" IS NULL;

-- Make it NOT NULL
ALTER TABLE "profiles" ALTER COLUMN "username" SET NOT NULL;

-- Add unique constraint
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_username_unique";
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_username_unique" UNIQUE("username");
