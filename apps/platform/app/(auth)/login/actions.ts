"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();
  const next = (formData.get('next') as string | null) ?? '';

  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback${
    next ? `?next=${encodeURIComponent(next)}` : ''
  }`;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "repo gist notifications",
        redirectTo: callbackUrl,
      },
    });

    if (error) {
      const encoded = encodeURIComponent(error.message);
      redirect(`/login?error=${encoded}`);
    }

    redirect(data.url);
  } catch (err) {
    throw err;
  }
}
