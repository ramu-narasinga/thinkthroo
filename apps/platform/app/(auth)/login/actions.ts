// "use server";

// import { revalidatePath } from "next/cache";
// import { redirect } from "next/navigation";

// import { createClient } from "@/utils/supabase/server";

// export async function login(formData: FormData) {
//   const supabase = await createClient();

//   // type-casting here for convenience
//   // in practice, you should validate your inputs
//   const data = {
//     email: formData.get("email") as string,
//     password: formData.get("password") as string,
//   };

//   const { error } = await supabase.auth.signInWithPassword(data);

//   if (error) {
//     const encoded = encodeURIComponent(error.message);
//     redirect(`/login?error=${encoded}`);
//   }

//   revalidatePath("/", "layout");
//   redirect("/");
// }

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login() {
  const supabase = await createClient();

  // Redirect to GitHub OAuth
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      scopes: "repo gist notifications", // request repo access
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    const encoded = encodeURIComponent(error.message);
    redirect(`/login?error=${encoded}`);
  }

  // Redirect user to GitHub OAuth consent screen
  redirect(data.url);
}