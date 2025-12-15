/**
 * Document interface for CodeArc platform
 * Represents files and folders in a repository structure
 */
export interface ArchitectureDocument {
  /**
   * Unique document identifier
   */
  id: string;

  /**
   * Repository this document belongs to
   */
  repositoryId: string | null;

  /**
   * User who owns this document
   */
  userId: string | null;

  /**
   * Parent document ID for folder hierarchy
   */
  parentId: string | null;

  /**
   * Document name
   */
  name: string;

  /**
   * Document type - 'file' or 'folder'
   */
  type: 'file' | 'folder';

  /**
   * Document content (null for folders)
   */
  content: string | null;

  /**
   * Document creation timestamp
   */
  createdAt: string;

  /**
   * Document last updated timestamp
   */
  updatedAt: string;
}