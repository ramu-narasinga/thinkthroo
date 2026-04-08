import { eq } from 'drizzle-orm';
import { teamInvitations } from '../schemas';
import { ThinkThrooDatabase } from '../type';

export interface NewTeamInvitation {
  fullName: string;
  email: string;
  invitedByUserId: string;
  status?: string;
}

export class TeamInvitationModel {
  private db: ThinkThrooDatabase;

  constructor(db: ThinkThrooDatabase) {
    this.db = db;
  }

  create = async (params: NewTeamInvitation) => {
    const [result] = await this.db
      .insert(teamInvitations)
      .values(params)
      .returning();

    return result;
  };

  getByEmail = async (email: string) => {
    return this.db
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.email, email));
  };

  getAll = async () => {
    return this.db.select().from(teamInvitations);
  };
}
