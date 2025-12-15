import jwt from "jsonwebtoken";

export function generateGithubAppJwt() {
  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iat: now,                   // issued at
      exp: now + 60 * 9,          // expires in 9 min (max 10)
      iss: process.env.GITHUB_APP_ID, // GitHub App ID
    },
    process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    { algorithm: "RS256" }
  );
}
