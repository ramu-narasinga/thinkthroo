import { resend } from '@/lib/resend';
import { TeamInvitationModel } from '@/database/models/teamInvitation';
import { ThinkThrooDatabase } from '@/database/type';

export class InviteService {
  private teamInvitationModel: TeamInvitationModel;

  constructor(db: ThinkThrooDatabase, private userId: string) {
    this.teamInvitationModel = new TeamInvitationModel(db);
  }

  async getAll() {
    return this.teamInvitationModel.getAll();
  }

  async sendInvite({ fullName, email }: { fullName: string; email: string }) {
    const { data, error } = await resend.emails.send({
      from: 'Think Throo <onboarding@resend.dev>',
      to: [email],
      subject: "You've been invited to join a team on Think Throo",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Hi ${fullName},</h2>
          <p>You've been invited to join a team on <strong>Think Throo</strong>.</p>
          <p>Click the button below to accept the invitation and get started.</p>
          <a
          href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://app.thinkthroo.com'}/invite?email=${encodeURIComponent(email)}"
            style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;"
          >
            Accept Invitation
          </a>
          <p style="margin-top:24px;color:#6b7280;font-size:13px;">
            If you weren't expecting this invite, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      throw new Error(error.message);
    }

    await this.teamInvitationModel.create({
      fullName,
      email,
      invitedByUserId: this.userId,
      status: 'pending',
    });

    return data;
  }
}
