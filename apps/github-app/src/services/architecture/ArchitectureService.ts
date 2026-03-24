import { env } from '../../utils/env';

export interface ArchitectureRuleChunk {
  id: string;
  score: number;
  text: string;
  name: string;
}

export class ArchitectureService {
  private baseUrl: string;
  private secret: string;

  constructor() {
    if (!env.PLATFORM_API_URL) {
      throw new Error('PLATFORM_API_URL environment variable is not set');
    }
    if (!env.PLATFORM_API_SECRET) {
      throw new Error('PLATFORM_API_SECRET environment variable is not set');
    }
    this.baseUrl = env.PLATFORM_API_URL;
    this.secret = env.PLATFORM_API_SECRET;
  }

  /**
   * Query the platform for architecture rule chunks relevant to a given code snippet.
   * Returns an empty array if the installation/repository is not found or has no rules.
   */
  queryRules = async (
    installationId: string,
    repositoryFullName: string,
    codeSnippet: string,
  ): Promise<ArchitectureRuleChunk[]> => {
    const url = `${this.baseUrl}/api/architecture/query`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': this.secret,
      },
      body: JSON.stringify({ installationId, repositoryFullName, codeSnippet }),
    });

    if (response.status === 404) {
      // Installation or repository not yet registered on the platform — skip silently
      return [];
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Architecture query failed [${response.status}]: ${text}`,
      );
    }

    const data = (await response.json()) as { results: ArchitectureRuleChunk[] };
    return data.results;
  };
}
