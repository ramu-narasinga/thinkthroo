import { LoginPageClient } from "@/components/login-page-client";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;
  const next = params?.next ?? '';

  return <LoginPageClient error={error} next={next} />;
}
