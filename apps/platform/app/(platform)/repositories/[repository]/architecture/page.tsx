import { redirect } from 'next/navigation';

export default async function ArchitecturePage({
  params,
}: {
  params: Promise<{ repository: string }>;
}) {
  const { repository } = await params;
  redirect(`/repositories/${repository}/skills`);
}
