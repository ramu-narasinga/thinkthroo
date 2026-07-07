import { NextRequest, NextResponse } from 'next/server';
import { serverDB } from '@/database';
import { TeamInvitationModel } from '@/database/models/teamInvitation';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.thinkthroo.com';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/login`);
  }

  const model = new TeamInvitationModel(serverDB);
  const invitation = await model.getByToken(token);

  if (!invitation || invitation.status !== 'pending') {
    return NextResponse.redirect(`${APP_URL}/login`);
  }

  await model.updateStatus(invitation.id, 'accepted');

  return NextResponse.redirect(`${APP_URL}/login`);
}
