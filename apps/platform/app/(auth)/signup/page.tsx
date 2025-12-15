import { SignupForm } from "@/components/signup-form";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const error = (await searchParams)?.error;
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm error={error} />
      </div>
    </div>
  );
}
