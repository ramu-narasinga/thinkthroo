import { and, eq, isNotNull } from 'drizzle-orm';
import { lessonProgress, courseEnrollment } from '../schemas';
import { ThinkThrooDatabase } from '../type';

// ── Lesson Progress ────────────────────────────────────────────────────

export interface MarkLessonParams {
  courseSlug: string;
  moduleSlug: string;
  chapterSlug: string;
  lessonSlug: string;
}

export class CourseProgressModel {
  private userId: string;
  private db: ThinkThrooDatabase;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  // ── Lesson Progress ──────────────────────────────────────────────────

  /**
   * Mark a lesson as complete for the current user (upsert).
   */
  markLessonComplete = async (params: MarkLessonParams) => {
    const now = new Date().toISOString();
    const [result] = await this.db
      .insert(lessonProgress)
      .values({
        userId: this.userId,
        courseSlug: params.courseSlug,
        moduleSlug: params.moduleSlug,
        chapterSlug: params.chapterSlug,
        lessonSlug: params.lessonSlug,
        completedAt: now,
      })
      .onConflictDoUpdate({
        target: [
          lessonProgress.userId,
          lessonProgress.courseSlug,
          lessonProgress.moduleSlug,
          lessonProgress.lessonSlug,
        ],
        set: { completedAt: now },
      })
      .returning();

    return result;
  };

  /**
   * Unmark a lesson completion (set completedAt to null).
   */
  markLessonIncomplete = async (params: MarkLessonParams) => {
    const [result] = await this.db
      .insert(lessonProgress)
      .values({
        userId: this.userId,
        courseSlug: params.courseSlug,
        moduleSlug: params.moduleSlug,
        chapterSlug: params.chapterSlug,
        lessonSlug: params.lessonSlug,
        completedAt: null,
      })
      .onConflictDoUpdate({
        target: [
          lessonProgress.userId,
          lessonProgress.courseSlug,
          lessonProgress.moduleSlug,
          lessonProgress.lessonSlug,
        ],
        set: { completedAt: null },
      })
      .returning();

    return result;
  };

  /**
   * Get all lesson progress rows for the user, optionally filtered by course
   * and/or module.
   */
  getLessonProgress = async (filters: {
    courseSlug?: string;
    moduleSlug?: string;
  }) => {
    const conditions = [eq(lessonProgress.userId, this.userId)];

    if (filters.courseSlug) {
      conditions.push(eq(lessonProgress.courseSlug, filters.courseSlug));
    }
    if (filters.moduleSlug) {
      conditions.push(eq(lessonProgress.moduleSlug, filters.moduleSlug));
    }

    return this.db
      .select()
      .from(lessonProgress)
      .where(and(...conditions));
  };

  /**
   * Get only the completed lessons for a user (completedAt is not null).
   */
  getCompletedLessons = async (filters: {
    courseSlug?: string;
    moduleSlug?: string;
  }) => {
    const conditions = [
      eq(lessonProgress.userId, this.userId),
      isNotNull(lessonProgress.completedAt),
    ];

    if (filters.courseSlug) {
      conditions.push(eq(lessonProgress.courseSlug, filters.courseSlug));
    }
    if (filters.moduleSlug) {
      conditions.push(eq(lessonProgress.moduleSlug, filters.moduleSlug));
    }

    return this.db
      .select()
      .from(lessonProgress)
      .where(and(...conditions));
  };

  /**
   * Get a single lesson's progress record.
   */
  getLessonStatus = async (params: {
    courseSlug: string;
    moduleSlug: string;
    lessonSlug: string;
  }) => {
    const [result] = await this.db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, this.userId),
          eq(lessonProgress.courseSlug, params.courseSlug),
          eq(lessonProgress.moduleSlug, params.moduleSlug),
          eq(lessonProgress.lessonSlug, params.lessonSlug),
        ),
      );

    return result ?? null;
  };

  // ── Course Enrollment ────────────────────────────────────────────────

  /**
   * Enroll the user in a module (or update lastAccessedAt if already enrolled).
   */
  enrollOrResume = async (params: {
    courseSlug: string;
    moduleSlug: string;
    lastChapterSlug?: string;
    lastLessonSlug?: string;
  }) => {
    const now = new Date().toISOString();
    const [result] = await this.db
      .insert(courseEnrollment)
      .values({
        userId: this.userId,
        courseSlug: params.courseSlug,
        moduleSlug: params.moduleSlug,
        enrolledAt: now,
        lastAccessedAt: now,
        lastChapterSlug: params.lastChapterSlug ?? null,
        lastLessonSlug: params.lastLessonSlug ?? null,
      })
      .onConflictDoUpdate({
        target: [
          courseEnrollment.userId,
          courseEnrollment.courseSlug,
          courseEnrollment.moduleSlug,
        ],
        set: {
          lastAccessedAt: now,
          ...(params.lastChapterSlug !== undefined && {
            lastChapterSlug: params.lastChapterSlug,
          }),
          ...(params.lastLessonSlug !== undefined && {
            lastLessonSlug: params.lastLessonSlug,
          }),
        },
      })
      .returning();

    return result;
  };

  /**
   * Update the last-visited lesson within an existing enrollment.
   */
  updateLastLesson = async (params: {
    courseSlug: string;
    moduleSlug: string;
    chapterSlug: string;
    lessonSlug: string;
  }) => {
    const [result] = await this.db
      .update(courseEnrollment)
      .set({
        lastAccessedAt: new Date().toISOString(),
        lastChapterSlug: params.chapterSlug,
        lastLessonSlug: params.lessonSlug,
      })
      .where(
        and(
          eq(courseEnrollment.userId, this.userId),
          eq(courseEnrollment.courseSlug, params.courseSlug),
          eq(courseEnrollment.moduleSlug, params.moduleSlug),
        ),
      )
      .returning();

    return result ?? null;
  };

  /**
   * Get enrollment for a specific module.
   */
  getEnrollment = async (params: {
    courseSlug: string;
    moduleSlug: string;
  }) => {
    const [result] = await this.db
      .select()
      .from(courseEnrollment)
      .where(
        and(
          eq(courseEnrollment.userId, this.userId),
          eq(courseEnrollment.courseSlug, params.courseSlug),
          eq(courseEnrollment.moduleSlug, params.moduleSlug),
        ),
      );

    return result ?? null;
  };

  /**
   * Get all enrollments for the user (used for dashboard).
   */
  getAllEnrollments = async () => {
    return this.db
      .select()
      .from(courseEnrollment)
      .where(eq(courseEnrollment.userId, this.userId));
  };

  /**
   * Get all enrollments for a course (used for course-level progress).
   */
  getCourseEnrollments = async (courseSlug: string) => {
    return this.db
      .select()
      .from(courseEnrollment)
      .where(
        and(
          eq(courseEnrollment.userId, this.userId),
          eq(courseEnrollment.courseSlug, courseSlug),
        ),
      );
  };
}
