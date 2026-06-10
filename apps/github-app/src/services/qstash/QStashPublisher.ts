import { Client } from "@upstash/qstash";

export interface PRJobPayload {
  installationId: string;
  owner: string;
  repo: string;
  repoName: string;
  prNumber: number;
  headSHA: string;
  baseSHA: string;
  headRef: string;
  baseRef: string;
  prTitle: string;
  prAuthor: string;
  action: "opened" | "reopened" | "synchronize";
}

export async function publishPRReviewJob(payload: PRJobPayload): Promise<void> {
  const client = new Client({ 
    token: process.env.QSTASH_TOKEN!,
     baseUrl: process.env.QSTASH_URL
  });
  await client.publishJSON({
    url: `${process.env.QSTASH_CONSUMER_URL}/api/process-review`,
    body: payload,
    retries: 3,
    deduplicationId: `${payload.installationId}-${payload.prNumber}-${payload.headSHA}`,
  });
}
