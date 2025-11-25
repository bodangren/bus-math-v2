import { relations } from 'drizzle-orm';
import { lessons } from './lessons';
import { phases } from './phases';
import { studentProgress } from './student-progress';
import { profiles } from './profiles';
import { competencyStandards, studentCompetency } from './competencies';
import { activities } from './activities';

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
  studentCompetencies: many(studentCompetency, {
    relationName: 'studentCompetencies',
  }),
  updatedCompetencies: many(studentCompetency, {
    relationName: 'updatedCompetencies',
  }),
}));

export const competencyStandardsRelations = relations(competencyStandards, ({ many }) => ({
  studentCompetencies: many(studentCompetency),
}));

export const studentCompetencyRelations = relations(studentCompetency, ({ one }) => ({
  student: one(profiles, {
    fields: [studentCompetency.studentId],
    references: [profiles.id],
    relationName: 'studentCompetencies',
  }),
  standard: one(competencyStandards, {
    fields: [studentCompetency.standardId],
    references: [competencyStandards.id],
  }),
  evidenceActivity: one(activities, {
    fields: [studentCompetency.evidenceActivityId],
    references: [activities.id],
  }),
  updater: one(profiles, {
    fields: [studentCompetency.updatedBy],
    references: [profiles.id],
    relationName: 'updatedCompetencies',
  }),
}));

export const activitiesRelations = relations(activities, ({ many }) => ({
  studentCompetencies: many(studentCompetency),
}));
