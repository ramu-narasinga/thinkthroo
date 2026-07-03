import { eq } from 'drizzle-orm';
import { teamInvitations } from '../schemas';
import { ThinkThrooDatabase } from '../type';

export interface NewTeamInvitation {
  fullName: string;
  email: string;
  invitedByUserId: string;
  organizationId: string;
  inviteToken: string;
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

  getAll = async (organizationId: string) => {
    return this.db
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.organizationId, organizationId));
  };

  getByToken = async (token: string) => {
    const [result] = await this.db
      .select()
      .from(teamInvitations)
      .where(eq(teamInvitations.inviteToken, token))
      .limit(1);

    return result ?? null;
  };

  updateStatus = async (id: string, status: string) => {
    const [result] = await this.db
      .update(teamInvitations)
      .set({ status })
      .where(eq(teamInvitations.id, id))
      .returning();

    return result;
  };
}
