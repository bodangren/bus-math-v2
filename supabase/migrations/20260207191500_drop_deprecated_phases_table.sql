-- Phase 7 final cleanup: remove deprecated legacy phase table.
-- Preconditions:
-- - runtime and seed code no longer references public.phases_deprecated
-- - student_progress.phase_id now points to phase_versions(id)

ALTER TABLE IF EXISTS public.student_progress
  VALIDATE CONSTRAINT student_progress_phase_id_phase_versions_id_fk;

DROP TABLE IF EXISTS public.phases_deprecated CASCADE;
