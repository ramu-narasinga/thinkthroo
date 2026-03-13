import { and, eq } from 'drizzle-orm';

import {
  AsyncTaskSelectItem,
  NewAsyncTaskItem,
  asyncTasks,
} from '../schemas';
import { ThinkThrooDatabase } from '../type';

export class AsyncTaskModel {
  private userId: string;
  private db: ThinkThrooDatabase;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (
    params: Omit<NewAsyncTaskItem, 'userId'>,
  ): Promise<string> => {
    const result = await this.db
      .insert(asyncTasks)
      .values({ ...params, userId: this.userId })
      .returning({ id: asyncTasks.id });

    return result[0]!.id;
  };

  update = async (id: string, value: Partial<AsyncTaskSelectItem>) => {
    return this.db
      .update(asyncTasks)
      .set({ ...value, updatedAt: new Date().toISOString() })
      .where(and(eq(asyncTasks.id, id), eq(asyncTasks.userId, this.userId)));
  };

  findById = async (id: string) => {
    return this.db.query.asyncTasks.findFirst({
      where: and(eq(asyncTasks.id, id), eq(asyncTasks.userId, this.userId)),
    });
  };
}
