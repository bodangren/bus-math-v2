import { relations } from 'drizzle-orm';
import { lessons } from './lessons';
import { lessonVersions, phaseVersions, phaseSections, lessonStandards } from './lesson-versions';
import { phases } from './phases';
import { studentProgress } from './student-progress';
import { profiles } from './profiles';
import { competencyStandards, studentCompetency } from './competencies';
import { activities } from './activities';

export const lessonsRelations = relations(lessons, ({ many }) => ({
  phases: many(phases),
  versions: many(lessonVersions),
  // Temporarily commented out until migration is applied to production
  // currentVersion: one(lessonVersions, {
  //   fields: [lessons.currentVersionId],
  //   references: [lessonVersions.id],
  // }),
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
  lessonStandards: many(lessonStandards),
  activities: many(activities),
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

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  studentCompetencies: many(studentCompetency),
  standard: one(competencyStandards, {
    fields: [activities.standardId],
    references: [competencyStandards.id],
  }),
}));

// Lesson Versioning Relations
export const lessonVersionsRelations = relations(lessonVersions, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [lessonVersions.lessonId],
    references: [lessons.id],
  }),
  phaseVersions: many(phaseVersions),
  standards: many(lessonStandards),
}));

export const phaseVersionsRelations = relations(phaseVersions, ({ one, many }) => ({
  lessonVersion: one(lessonVersions, {
    fields: [phaseVersions.lessonVersionId],
    references: [lessonVersions.id],
  }),
  sections: many(phaseSections),
}));

export const phaseSectionsRelations = relations(phaseSections, ({ one }) => ({
  phaseVersion: one(phaseVersions, {
    fields: [phaseSections.phaseVersionId],
    references: [phaseVersions.id],
  }),
}));

export const lessonStandardsRelations = relations(lessonStandards, ({ one }) => ({
  lessonVersion: one(lessonVersions, {
    fields: [lessonStandards.lessonVersionId],
    references: [lessonVersions.id],
  }),
  standard: one(competencyStandards, {
    fields: [lessonStandards.standardId],
    references: [competencyStandards.id],
  }),
}));
