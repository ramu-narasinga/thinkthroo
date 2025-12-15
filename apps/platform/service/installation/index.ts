import { InstallationModel } from '@/database/models/installation';
import { ThinkThrooDatabase } from '@/database/type';
import { generateGithubAppJwt } from '@/lib/generate-github-app-jwt';

export interface ProcessCallbackParams {
  installationId: string;
  organizationId: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  default_branch: string;
  private: boolean;
  visibility: string; // public or private
}

export interface GitHubInstallation {
  id: number;
  account: {
    login: string;
    id: number;
    type: string;
  };
}

export class InstallationService {
  private installationModel: InstallationModel;
  private userId: string;

  constructor(db: ThinkThrooDatabase, userId: string) {
    this.userId = userId;
    this.installationModel = new InstallationModel(db, userId);
  }

  /**
   * Process GitHub App installation callback
   * 1. Fetches installation details from GitHub
   * 2. Generates installation access token
   * 3. Fetches repositories
   * 4. Stores everything in database
   */
  async processCallback(params: ProcessCallbackParams) {
    const { installationId, organizationId } = params;

    // 1. Fetch installation details from GitHub
    const installation = await this.fetchInstallationDetails(installationId);
    const githubOrgId = installation.account?.login;

    if (!githubOrgId) {
      throw new Error('Could not determine GitHub organization ID from installation');
    }

    // 2. Store installation in database
    await this.installationModel.upsertInstallation({
      installationId,
      githubOrgId,
      userId: this.userId,
    });

    // 3. Generate installation access token
    const accessToken = await this.generateInstallationToken(installationId);

    // 4. Fetch repositories from GitHub
    const repos = await this.fetchInstallationRepositories(accessToken);

    // 5. Smart sync repositories (upsert + mark removed)
    const repoData = repos.map((repo) => ({
      githubRepoId: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      defaultBranch: repo.default_branch,
      private: repo.private,
      installationId,
      organizationId,
      userId: this.userId,
    }));

    await this.installationModel.syncRepositories(installationId, repoData);

    return {
      installationId,
      githubOrgId,
      repoCount: repos.length,
    };
  }

  /**
   * Fetch installation details from GitHub API
   */
  private async fetchInstallationDetails(
    installationId: string
  ): Promise<GitHubInstallation> {
    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}`,
      {
        headers: {
          Authorization: `Bearer ${generateGithubAppJwt()}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to fetch installation details: ${JSON.stringify(error)}`
      );
    }

    return response.json();
  }

  /**
   * Generate installation access token for GitHub API
   */
  private async generateInstallationToken(
    installationId: string
  ): Promise<string> {
    const response = await fetch(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${generateGithubAppJwt()}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to create installation token: ${JSON.stringify(error)}`
      );
    }

    const data = await response.json();
    return data.token;
  }

  /**
   * Fetch repositories accessible to the installation
   */
  private async fetchInstallationRepositories(
    accessToken: string
  ): Promise<GitHubRepository[]> {
    const response = await fetch(
      'https://api.github.com/installation/repositories',
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to fetch repositories: ${JSON.stringify(error)}`
      );
    }

    const data = await response.json();
    return data.repositories || [];
  }

  /**
   * Get installation by installation ID
   */
  async getInstallation(installationId: string) {
    return this.installationModel.findByInstallationId(installationId);
  }

  /**
   * Get all installations for user
   */
  async getAllInstallations() {
    return this.installationModel.findAll();
  }

  /**
   * Get repositories for specific installation (from database)
   */
  async getRepositories(installationId: string) {
    return this.installationModel.getRepositoriesByInstallation(
      installationId
    );
  }

  /**
   * Get all repositories for user (from database)
   * Returns all repos including those with revoked access
   */
  async getAllRepositories() {
    return this.installationModel.getAllRepositories();
  }

  /**
   * Sync repositories with GitHub API
   * Should only be called during installation/webhook, not on page load
   */
  async syncWithGitHub(installationId: string, organizationId: string) {
    try {
      // Generate installation token
      const accessToken = await this.generateInstallationToken(installationId);

      // Fetch repositories from GitHub
      const repos = await this.fetchInstallationRepositories(accessToken);

      // Prepare repository data
      const repoData = repos.map((repo) => ({
        githubRepoId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        htmlUrl: repo.html_url,
        defaultBranch: repo.default_branch,
        private: repo.private,
        installationId,
        organizationId,
        userId: this.userId,
      }));

      // Smart sync: upsert accessible, mark removed
      await this.installationModel.syncRepositories(installationId, repoData);

      return {
        success: true,
        repoCount: repos.length,
      };
    } catch (error) {
      console.error(
        `[InstallationService] Failed to sync repos for installation ${installationId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Fetch live repositories from GitHub API for user's installations
   * This gets the current state from GitHub, not just what's in our database
   */
  async fetchLiveRepositories() {
    // Get all installations for this user
    const installations = await this.installationModel.findAll();

    if (installations.length === 0) {
      return [];
    }

    // Fetch repos for each installation
    const allRepos: GitHubRepository[] = [];

    for (const installation of installations) {
      try {
        // Generate installation token
        const accessToken = await this.generateInstallationToken(
          installation.installationId
        );

        // Fetch repositories
        const repos = await this.fetchInstallationRepositories(accessToken);
        
        // Map to include visibility field for frontend
        const mappedRepos = repos.map(repo => ({
          ...repo,
          visibility: repo.private ? 'private' : 'public',
        }));
        
        allRepos.push(...mappedRepos);
      } catch (error) {
        console.error(
          `[InstallationService] Failed to fetch repos for installation ${installation.installationId}:`,
          error
        );
        // Continue with other installations even if one fails
      }
    }

    return allRepos;
  }

  /**
   * Delete installation (cascades to repositories)
   */
  async deleteInstallation(installationId: string) {
    return this.installationModel.delete(installationId);
  }
}
