import { z } from 'zod';
import { authedProcedure, router } from '@/lib/trpc/lambda';
import { serverDatabase } from '@/lib/trpc/lambda/middleware';
import { CourseProgressModel } from '@/database/models/courseProgress';
import { CourseProgressService } from '@/server/service/courseProgress';

const courseProgressProcedure = authedProcedure
  .use(serverDatabase)
  .use(async (opts) => {
    const { ctx } = opts;
    return opts.next({
      ctx: {
        courseProgressModel: new CourseProgressModel(ctx.serverDB, ctx.userId),
        courseProgressService: new CourseProgressService(ctx.serverDB, ctx.userId),
      },
    });
  });

const lessonParamsSchema = z.object({
  courseSlug: z.string().min(1),
  moduleSlug: z.string().min(1),
  chapterSlug: z.string().min(1),
  lessonSlug: z.string().min(1),
});

export const courseProgressRouter = router({
  // ── Lesson progress ─────────────────────────────────────────────────

  /**
   * Mark a lesson as complete and upsert the enrollment resume pointer.
   */
  markLessonComplete: courseProgressProcedure
    .input(lessonParamsSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.courseProgressService.markLessonComplete(input);
    }),

  /**
   * Toggle a lesson back to incomplete.
   */
  markLessonIncomplete: courseProgressProcedure
    .input(lessonParamsSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.courseProgressService.markLessonIncomplete(input);
    }),

  /**
   * Fetch all progress rows for a course (optionally filtered by module).
   */
  getLessonProgress: courseProgressProcedure
    .input(
      z.object({
        courseSlug: z.string().optional(),
        moduleSlug: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.courseProgressService.getLessonProgress(input);
    }),

  /**
   * Fetch only completed lessons — lightweight, used for progress bars.
   */
  getCompletedLessons: courseProgressProcedure
    .input(
      z.object({
        courseSlug: z.string().optional(),
        moduleSlug: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.courseProgressService.getCompletedLessons(input);
    }),

  /**
   * Check whether a specific lesson is completed.
   */
  getLessonStatus: courseProgressProcedure
    .input(
      z.object({
        courseSlug: z.string().min(1),
        moduleSlug: z.string().min(1),
        lessonSlug: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.courseProgressService.getLessonStatus(input);
    }),

  // ── Enrollment ───────────────────────────────────────────────────────

  /**
   * Enroll in a module (first visit) or update lastAccessedAt (returning).
   * Returns the enrollment row including lastLessonSlug for client-side redirect.
   */
  enrollOrResume: courseProgressProcedure
    .input(
      z.object({
        courseSlug: z.string().min(1),
        moduleSlug: z.string().min(1),
        lastChapterSlug: z.string().optional(),
        lastLessonSlug: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.courseProgressService.enrollOrResume(input);
    }),

  /**
   * Persist the last-visited lesson as the user navigates.
   */
  updateLastLesson: courseProgressProcedure
    .input(lessonParamsSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.courseProgressService.updateLastLesson(input);
    }),

  /**
   * Get a single module enrollment (Start / Resume / Restart detection).
   */
  getEnrollment: courseProgressProcedure
    .input(
      z.object({
        courseSlug: z.string().min(1),
        moduleSlug: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.courseProgressService.getEnrollment(input);
    }),

  /**
   * Get all enrollments — used by the Dashboard page.
   */
  getAllEnrollments: courseProgressProcedure.query(async ({ ctx }) => {
    return ctx.courseProgressService.getAllEnrollments();
  }),

  /**
   * Get enrollments for a specific course with computed progress percentages.
   * `totalLessonsPerModule` must be provided by the caller from CMS data.
   */
  getCourseProgressSummary: courseProgressProcedure
    .input(
      z.object({
        courseSlug: z.string().min(1),
        /** Map of moduleSlug → total lesson count (from Sanity / static data) */
        totalLessonsPerModule: z.record(z.string(), z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      return ctx.courseProgressService.getCourseProgressSummary(
        input.courseSlug,
        input.totalLessonsPerModule,
      );
    }),
});
