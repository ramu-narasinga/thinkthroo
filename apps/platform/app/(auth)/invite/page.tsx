import { InviteSignInClient } from "@/components/invite-sign-in-client";

export default async function InvitePage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string }>;
}) {
  const email = (await searchParams)?.email ?? "";
  return <InviteSignInClient email={email} />;
}
