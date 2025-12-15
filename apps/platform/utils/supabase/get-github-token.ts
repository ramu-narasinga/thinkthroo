import { createClient } from "@/utils/supabase/server";
import { Octokit } from "octokit";
import { createAppAuth } from "@octokit/auth-app";

export async function getGithubToken() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // The GitHub access token
  const githubToken = session?.provider_token;
  return githubToken;
}

export async function getInstallationAccessToken(installationId: string) {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
      installationId: Number(installationId),
    },
  });

  const token = await octokit.auth({ type: "installation" });

  return token.token;
}