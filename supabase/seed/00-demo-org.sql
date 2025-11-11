-- Seed script for demo organization
-- This creates a demo organization with a known UUID for testing and development

-- Insert demo organization
-- Using a fixed UUID so it can be referenced consistently across environments
INSERT INTO organizations (id, name, slug, settings, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Demo School',
  'demo-school',
  '{"timezone": "America/New_York", "locale": "en-US", "features": {"enableLivePolling": true, "enableLeaderboards": true, "enableAnalytics": true}}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  settings = EXCLUDED.settings,
  updated_at = now();

-- Note: This seed script only creates the organization.
-- User profiles will be created during the sign-up process with organizationId references.
