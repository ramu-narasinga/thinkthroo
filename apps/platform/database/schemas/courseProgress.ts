import {
  pgTable,
  uuid,
  text,
  timestamp,
  unique,
  pgPolicy,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users as authUsers } from './auth';
import { timestamps } from './_helpers';

/**
 * Tracks per-lesson completion for a user.
 * A row is inserted the first time a user starts a lesson, then updated
 * when they mark it complete (completedAt is set).
 */
export const lessonProgress = pgTable(
  'lesson_progress',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    /** Top-level course slug, e.g. "architecture" | "production-grade-projects" */
    courseSlug: text('course_slug').notNull(),
    /** Module slug, e.g. "api-layer" | "components-structure" */
    moduleSlug: text('module_slug').notNull(),
    /** Chapter slug / title used as a stable identifier */
    chapterSlug: text('chapter_slug').notNull(),
    /** Lesson slug from Sanity (or static id for non-Sanity content) */
    lessonSlug: text('lesson_slug').notNull(),
    /** Null until the user marks the lesson complete */
    completedAt: timestamp('completed_at', {
      withTimezone: true,
      mode: 'string',
    }),
    ...timestamps,
  },
  (table) => [
    unique('unique_user_lesson').on(
      table.userId,
      table.courseSlug,
      table.moduleSlug,
      table.lessonSlug,
    ),
    pgPolicy('Users can select their own lesson progress', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('Users can insert their own lesson progress', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
      withCheck: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('Users can update their own lesson progress', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('Users can delete their own lesson progress', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
  ],
);

/**
 * Tracks which course+module a user has enrolled in and where they left off.
 * Used to power "Resume" vs "Start" vs "Restart" buttons and overall progress.
 */
export const courseEnrollment = pgTable(
  'course_enrollment',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    /** Top-level course slug, e.g. "architecture" */
    courseSlug: text('course_slug').notNull(),
    /** Module slug, e.g. "api-layer" */
    moduleSlug: text('module_slug').notNull(),
    enrolledAt: timestamp('enrolled_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    lastAccessedAt: timestamp('last_accessed_at', {
      withTimezone: true,
      mode: 'string',
    })
      .defaultNow()
      .notNull(),
    /** Slug of the last chapter the user was in (for resume) */
    lastChapterSlug: text('last_chapter_slug'),
    /** Slug of the last lesson the user was viewing (for resume) */
    lastLessonSlug: text('last_lesson_slug'),
    ...timestamps,
  },
  (table) => [
    unique('unique_user_module_enrollment').on(
      table.userId,
      table.courseSlug,
      table.moduleSlug,
    ),
    pgPolicy('Users can select their own enrollments', {
      as: 'permissive',
      for: 'select',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('Users can insert their own enrollments', {
      as: 'permissive',
      for: 'insert',
      to: ['authenticated'],
      withCheck: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('Users can update their own enrollments', {
      as: 'permissive',
      for: 'update',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
    pgPolicy('Users can delete their own enrollments', {
      as: 'permissive',
      for: 'delete',
      to: ['authenticated'],
      using: sql`(auth.uid() = user_id)`,
    }),
  ],
);
