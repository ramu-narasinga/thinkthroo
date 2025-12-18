import { LoginPageClient } from "@/components/login-page-client";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const error = (await searchParams)?.error;
  
  return <LoginPageClient error={error} />;
}
