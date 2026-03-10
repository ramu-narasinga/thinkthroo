import { eq } from 'drizzle-orm';
import { skillStats } from '../schemas';
import { ThinkThrooDatabase } from '../type';

export interface SkillStatsRow {
  id: string;
  skillSlug: string;
  weeklyDownloads: number;
  totalDownloads: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export class SkillStatsModel {
  private db: ThinkThrooDatabase;

  constructor(db: ThinkThrooDatabase) {
    this.db = db;
  }

  /** Get stats for a single skill by slug */
  getBySlug = async (slug: string): Promise<SkillStatsRow | null> => {
    const [row] = await this.db
      .select()
      .from(skillStats)
      .where(eq(skillStats.skillSlug, slug))
      .limit(1);
    return (row as SkillStatsRow) ?? null;
  };

  /** Get stats for all skills */
  getAll = async (): Promise<SkillStatsRow[]> => {
    return this.db.select().from(skillStats) as Promise<SkillStatsRow[]>;
  };

  /** Upsert stats for a skill slug */
  upsert = async (params: {
    skillSlug: string;
    weeklyDownloads?: number;
    totalDownloads?: number;
  }) => {
    const [row] = await this.db
      .insert(skillStats)
      .values({
        skillSlug: params.skillSlug,
        weeklyDownloads: params.weeklyDownloads ?? 0,
        totalDownloads: params.totalDownloads ?? 0,
      })
      .onConflictDoUpdate({
        target: skillStats.skillSlug,
        set: {
          weeklyDownloads: params.weeklyDownloads ?? 0,
          totalDownloads: params.totalDownloads ?? 0,
          updatedAt: new Date().toISOString(),
        },
      })
      .returning();
    return row;
  };
}
