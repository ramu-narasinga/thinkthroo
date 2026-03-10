import { CourseProgressModel, MarkLessonParams } from '@/database/models/courseProgress';
import { ThinkThrooDatabase } from '@/database/type';

export class CourseProgressService {
  private userId: string;
  private db: ThinkThrooDatabase;
  private model: CourseProgressModel;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
    this.model = new CourseProgressModel(db, userId);
  }

  // ── Lesson operations ────────────────────────────────────────────────

  /**
   * Mark a lesson as complete and update the enrollment's last-lesson pointer.
   */
  async markLessonComplete(params: MarkLessonParams) {
    const [progress] = await Promise.all([
      this.model.markLessonComplete(params),
      // Ensure an enrollment row exists and last-lesson is up to date
      this.model.enrollOrResume({
        courseSlug: params.courseSlug,
        moduleSlug: params.moduleSlug,
        lastChapterSlug: params.chapterSlug,
        lastLessonSlug: params.lessonSlug,
      }),
    ]);

    return progress;
  }

  /**
   * Unmark a lesson completion (toggle back to incomplete).
   */
  async markLessonIncomplete(params: MarkLessonParams) {
    return this.model.markLessonIncomplete(params);
  }

  /**
   * Get all lesson progress rows for a course / module.
   */
  async getLessonProgress(filters: { courseSlug?: string; moduleSlug?: string }) {
    return this.model.getLessonProgress(filters);
  }

  /**
   * Get only completed lessons for quick progress calculation.
   */
  async getCompletedLessons(filters: { courseSlug?: string; moduleSlug?: string }) {
    return this.model.getCompletedLessons(filters);
  }

  /**
   * Get the completion status of a single lesson.
   */
  async getLessonStatus(params: {
    courseSlug: string;
    moduleSlug: string;
    lessonSlug: string;
  }) {
    return this.model.getLessonStatus(params);
  }

  // ── Enrollment operations ─────────────────────────────────────────────

  /**
   * Start a module or mark the user as returning (resume).
   * Returns the enrollment row, which includes lastLessonSlug for redirect.
   */
  async enrollOrResume(params: {
    courseSlug: string;
    moduleSlug: string;
    lastChapterSlug?: string;
    lastLessonSlug?: string;
  }) {
    return this.model.enrollOrResume(params);
  }

  /**
   * After navigating to a lesson, persist the last-visited position.
   */
  async updateLastLesson(params: {
    courseSlug: string;
    moduleSlug: string;
    chapterSlug: string;
    lessonSlug: string;
  }) {
    return this.model.updateLastLesson(params);
  }

  /**
   * Retrieve a single module enrollment (for Start / Resume / Restart logic).
   */
  async getEnrollment(params: { courseSlug: string; moduleSlug: string }) {
    return this.model.getEnrollment(params);
  }

  /**
   * Return all enrollments for the user (dashboard aggregation).
   */
  async getAllEnrollments() {
    return this.model.getAllEnrollments();
  }

  /**
   * Return all enrollments for a specific course.
   */
  async getCourseEnrollments(courseSlug: string) {
    return this.model.getCourseEnrollments(courseSlug);
  }

  // ── Aggregated progress ───────────────────────────────────────────────

  /**
   * Return a summary of progress for a course: completed + in-progress modules
   * with their completed-lesson counts.
   *
   * The caller supplies `totalLessonsPerModule` because lesson counts come from
   * the CMS (Sanity) rather than the database.
   */
  async getCourseProgressSummary(
    courseSlug: string,
    totalLessonsPerModule: Record<string, number>,
  ) {
    const [enrollments, completedLessons] = await Promise.all([
      this.model.getCourseEnrollments(courseSlug),
      this.model.getCompletedLessons({ courseSlug }),
    ]);

    const completedCountByModule: Record<string, number> = {};
    for (const row of completedLessons) {
      completedCountByModule[row.moduleSlug] =
        (completedCountByModule[row.moduleSlug] ?? 0) + 1;
    }

    return enrollments.map((enrollment) => {
      const completedCount = completedCountByModule[enrollment.moduleSlug] ?? 0;
      const total = totalLessonsPerModule[enrollment.moduleSlug] ?? 0;
      const progressPercent =
        total > 0 ? Math.round((completedCount / total) * 100) : 0;

      return {
        ...enrollment,
        completedLessons: completedCount,
        totalLessons: total,
        progressPercent,
        isCompleted: total > 0 && completedCount >= total,
      };
    });
  }
}
