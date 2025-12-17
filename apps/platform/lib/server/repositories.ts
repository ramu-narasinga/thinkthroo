import { InstallationService } from '@/service/installation';
import { getServerDB } from '@/database/core/db-adaptor';
import { createClient } from '@/utils/supabase/server';

/**
 * Server-side helper to fetch repositories using service layer
 * Used in Server Components
 */
export async function getRepositoriesForUser() {
  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      repositories: [],
      error: 'User not authenticated',
    };
  }

  try {
    // Get database connection
    const db = await getServerDB();

    // Create service instance
    const installationService = new InstallationService(db, user.id);

    // Fetch live repositories from GitHub
    const repositories = await installationService.fetchLiveRepositories();

    return {
      user,
      repositories,
      error: null,
    };
  } catch (error) {
    console.error('[getRepositoriesForUser] Error:', error);
    return {
      user,
      repositories: [],
      error: error instanceof Error ? error.message : 'Failed to fetch repositories',
    };
  }
}

/**
 * Check if user has any installations
 */
export async function checkUserInstallations() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { hasInstallations: false, user: null };
  }

  try {
    const db = await getServerDB();
    const installationService = new InstallationService(db, user.id);
    const installations = await installationService.getAllInstallations();

    return {
      hasInstallations: installations.length > 0,
      user,
      installations,
    };
  } catch (error) {
    console.error('[checkUserInstallations] Error:', error);
    return { hasInstallations: false, user };
  }
}
