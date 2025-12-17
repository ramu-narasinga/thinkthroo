import { DocumentItem } from '@/database/schemas';

export interface DocumentTreeNode extends DocumentItem {
  children?: DocumentTreeNode[];
}

/**
 * Build a tree structure from flat document array
 */
export function buildDocumentTree(documents: DocumentItem[]): DocumentTreeNode[] {
  const documentMap = new Map<string, DocumentTreeNode>();
  const rootNodes: DocumentTreeNode[] = [];

  // First pass: create all nodes
  documents.forEach((doc) => {
    documentMap.set(doc.id, { ...doc, children: [] });
  });

  // Second pass: build the tree
  documents.forEach((doc) => {
    const node = documentMap.get(doc.id)!;

    if (!doc.parentId) {
      // Root level node
      rootNodes.push(node);
    } else {
      // Child node
      const parent = documentMap.get(doc.parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
      } else {
        // Parent not found, treat as root (shouldn't happen with proper data)
        rootNodes.push(node);
      }
    }
  });

  // Sort: folders first, then by name
  const sortNodes = (nodes: DocumentTreeNode[]) => {
    nodes.sort((a, b) => {
      // Folders come before files
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      // Alphabetical by name
      return a.name.localeCompare(b.name);
    });

    // Recursively sort children
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(rootNodes);

  return rootNodes;
}

/**
 * Get all descendant IDs of a document (for deletion)
 */
export function getDescendantIds(
  documentId: string,
  documents: DocumentItem[]
): string[] {
  const ids: string[] = [documentId];
  const children = documents.filter((doc) => doc.parentId === documentId);

  children.forEach((child) => {
    ids.push(...getDescendantIds(child.id, documents));
  });

  return ids;
}

/**
 * Check if a document is a descendant of another
 */
export function isDescendant(
  childId: string,
  ancestorId: string,
  documents: DocumentItem[]
): boolean {
  const child = documents.find((doc) => doc.id === childId);
  if (!child || !child.parentId) return false;
  if (child.parentId === ancestorId) return true;
  return isDescendant(child.parentId, ancestorId, documents);
}

/**
 * Get all parent folder IDs for a document
 * Returns an array of folder IDs from immediate parent to root
 */
export function getParentFolderIds(
  documentId: string,
  documents: DocumentItem[]
): string[] {
  const parentIds: string[] = [];
  const document = documents.find((doc) => doc.id === documentId);
  
  if (!document || !document.parentId) {
    return parentIds;
  }

  let currentParentId: string | null = document.parentId;
  
  while (currentParentId) {
    const parent = documents.find((doc) => doc.id === currentParentId);
    if (!parent) break;
    
    if (parent.type === 'folder') {
      parentIds.push(parent.id);
    }
    
    currentParentId = parent.parentId || null;
  }

  return parentIds;
}
