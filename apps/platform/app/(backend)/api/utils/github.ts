import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "octokit";

// Pulled from https://github.com/usecloudy/cloudy/blob/20d98d0dbb0e69b2624bae91e1c13310ca024d69/apps/web/app/api/utils/github.ts#L17
export const getOctokitAppClient = (installationId?: string) => {
	return new Octokit({
		authStrategy: createAppAuth,
		auth: {
			appId: process.env.GITHUB_APP_ID!,
			privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
			installationId,
		},
	});
};