"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  Sentry.addBreadcrumb({
    category: "auth",
    message: "User signup attempt",
    level: "info",
    data: {
      email: data.email,
      has_password: !!data.password,
    },
  });

  try {
    const { error } = await supabase.auth.signUp(data);

    if (error) {
      Sentry.captureException(error, {
        tags: {
          action: "signup",
          error_type: "auth_error",
        },
        contexts: {
          signup: {
            email: data.email,
            error_message: error.message,
          },
        },
      });
      
      const encoded = encodeURIComponent(error.message);
      redirect(`/signup?error=${encoded}`);
    }

    Sentry.addBreadcrumb({
      category: "auth",
      message: "User signup successful",
      level: "info",
      data: { email: data.email },
    });

    revalidatePath("/", "layout");
    redirect("/");
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        action: "signup",
        flow: "email_password",
      },
      contexts: {
        signup: {
          email: data.email,
        },
      },
    });
    throw err;
  }
}
