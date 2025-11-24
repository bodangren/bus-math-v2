import { relations } from 'drizzle-orm';
import { lessons } from './lessons';
import { phases } from './phases';
import { studentProgress } from './student-progress';
import { profiles } from './profiles';

export const lessonsRelations = relations(lessons, ({ many }) => ({
  phases: many(phases),
}));

export const phasesRelations = relations(phases, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [phases.lessonId],
    references: [lessons.id],
  }),
  studentProgress: many(studentProgress),
}));

export const studentProgressRelations = relations(studentProgress, ({ one }) => ({
  profile: one(profiles, {
    fields: [studentProgress.userId],
    references: [profiles.id],
  }),
  phase: one(phases, {
    fields: [studentProgress.phaseId],
    references: [phases.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  studentProgress: many(studentProgress),
}));
