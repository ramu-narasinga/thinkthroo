/**
 * Test file for PR Summary and Review generation
 * 
 * This file contains intentional code patterns for testing:
 * - Good practices to summarize
 * - Some issues for the reviewer to catch
 * - Various code patterns
 */

// Configuration object - good pattern
const config = {
  maxRetries: 3,
  timeout: 5000,
  baseUrl: "https://api.example.com",
};

// Interface definition
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

// Type for API response
type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

/**
 * Fetches a user by ID from the API
 * @param userId - The user's unique identifier
 * @returns Promise with the user data
 */
async function fetchUser(userId: number): Promise<ApiResponse<User>> {
  // Issue: No input validation
  const response = await fetch(`${config.baseUrl}/users/${userId}`);
  
  // Issue: Not checking response.ok
  const data = await response.json();
  
  return {
    success: true,
    data: data,
  };
}

/**
 * Creates a new user in the system
 * @param user - User data without ID
 */
async function createUser(user: Omit<User, "id" | "createdAt">): Promise<ApiResponse<User>> {
  // Good: Using try-catch for error handling
  try {
    const response = await fetch(`${config.baseUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    // Issue: Catching error but not properly typing it
    return { 
      success: false, 
      data: null as any, // Issue: Using 'any' type
      error: error.message 
    };
  }
}

/**
 * Batch process users with rate limiting
 */
async function processUsers(userIds: number[]): Promise<User[]> {
  const results: User[] = [];
  
  // Issue: No concurrency control, could overwhelm the API
  for (const id of userIds) {
    const response = await fetchUser(id);
    if (response.success) {
      results.push(response.data);
    }
  }
  
  return results;
}

/**
 * Utility function to validate email format
 */
function isValidEmail(email: string): boolean {
  // Simple email regex - could be improved
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Calculate user statistics
 */
function calculateStats(users: User[]): { total: number; averageNameLength: number } {
  if (users.length === 0) {
    return { total: 0, averageNameLength: 0 };
  }

  const totalNameLength = users.reduce((sum, user) => sum + user.name.length, 0);
  
  return {
    total: users.length,
    averageNameLength: totalNameLength / users.length,
  };
}

// Export functions for testing
export {
  fetchUser,
  createUser,
  processUsers,
  isValidEmail,
  calculateStats,
  config,
};

export type { User, ApiResponse };
