import { lambdaClient } from '@/lib/trpc/client/lambda';

/**
 * Client-side service for course progress operations.
 * All calls go through the tRPC lambda client.
 */
export const courseProgressClient = {
  // ── Lesson progress ─────────────────────────────────────────────────

  /**
   * Mark a lesson as complete. Also upserts the enrollment to track resume position.
   */
  markLessonComplete: (params: {
    courseSlug: string;
    moduleSlug: string;
    chapterSlug: string;
    lessonSlug: string;
  }) => lambdaClient.courseProgress.markLessonComplete.mutate(params),

  /**
   * Toggle a lesson back to incomplete.
   */
  markLessonIncomplete: (params: {
    courseSlug: string;
    moduleSlug: string;
    chapterSlug: string;
    lessonSlug: string;
  }) => lambdaClient.courseProgress.markLessonIncomplete.mutate(params),

  /**
   * Get all lesson progress rows, optionally scoped to a course or module.
   */
  getLessonProgress: (filters: { courseSlug?: string; moduleSlug?: string }) =>
    lambdaClient.courseProgress.getLessonProgress.query(filters),

  /**
   * Get only completed lessons — lightweight for progress-bar calculations.
   */
  getCompletedLessons: (filters: { courseSlug?: string; moduleSlug?: string }) =>
    lambdaClient.courseProgress.getCompletedLessons.query(filters),

  /**
   * Check whether a specific lesson is completed.
   */
  getLessonStatus: (params: {
    courseSlug: string;
    moduleSlug: string;
    lessonSlug: string;
  }) => lambdaClient.courseProgress.getLessonStatus.query(params),

  // ── Enrollment ───────────────────────────────────────────────────────

  /**
   * Enroll in a module (first time) or record that the user returned to it.
   * Returns the enrollment including `lastLessonSlug` for "Resume" navigation.
   */
  enrollOrResume: (params: {
    courseSlug: string;
    moduleSlug: string;
    lastChapterSlug?: string;
    lastLessonSlug?: string;
  }) => lambdaClient.courseProgress.enrollOrResume.mutate(params),

  /**
   * Persist the current lesson as the user navigates between lessons.
   */
  updateLastLesson: (params: {
    courseSlug: string;
    moduleSlug: string;
    chapterSlug: string;
    lessonSlug: string;
  }) => lambdaClient.courseProgress.updateLastLesson.mutate(params),

  /**
   * Fetch enrollment for a single module — drives Start / Resume / Restart UI.
   */
  getEnrollment: (params: { courseSlug: string; moduleSlug: string }) =>
    lambdaClient.courseProgress.getEnrollment.query(params),

  /**
   * Fetch all enrollments for the dashboard overview.
   */
  getAllEnrollments: () =>
    lambdaClient.courseProgress.getAllEnrollments.query(),

  /**
   * Fetch progress summary (with percentages) for a course.
   * `totalLessonsPerModule` comes from CMS / static course data.
   */
  getCourseProgressSummary: (params: {
    courseSlug: string;
    totalLessonsPerModule: Record<string, number>;
  }) => lambdaClient.courseProgress.getCourseProgressSummary.query(params),
};
