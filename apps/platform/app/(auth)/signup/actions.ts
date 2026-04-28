"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { SlackNotifier } from "@/lib/slack";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  try {
    const { error } = await supabase.auth.signUp(data);

    if (error) {
      
      const encoded = encodeURIComponent(error.message);
      redirect(`/signup?error=${encoded}`);
    }

    // Fire Slack notification (non-blocking, errors are swallowed internally)
    await SlackNotifier.newSignup(data.email);

    revalidatePath("/", "layout");
    redirect("/");
  } catch (err) {
    throw err;
  }
}
