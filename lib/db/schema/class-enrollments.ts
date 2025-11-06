import { pgEnum, pgTable, timestamp, uuid, uniqueIndex } from 'drizzle-orm/pg-core';

import { classes } from './classes';
import { profiles } from './profiles';

export const enrollmentStatusEnum = pgEnum('enrollment_status', ['active', 'withdrawn', 'completed']);

export const classEnrollments = pgTable(
  'class_enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    classId: uuid('class_id')
      .notNull()
      .references(() => classes.id, { onDelete: 'cascade' }),
    studentId: uuid('student_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    enrolledAt: timestamp('enrolled_at').defaultNow().notNull(),
    status: enrollmentStatusEnum('status').notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueClassStudent: uniqueIndex('class_enrollments_unique_student').on(table.classId, table.studentId),
  }),
);

