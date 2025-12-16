import { documentService } from '@/service/document';
import { FileStore } from '../../store';
import { StateCreator } from 'zustand/vanilla';

export interface DocumentResponse {
    id: string;
    repository_id: string;
    parent_id: string | null;
    name: string;
    type: "file" | "folder";
    content: string | null;
    created_at: string;
    updated_at: string;
    user_id: string;
}

export interface DocumentAction {
    updateDocumentOptimistically: (id: string, content: string) => Promise<void>;
}

export const createDocumentSlice: StateCreator<
  FileStore,
  [['zustand/devtools', never]],
  [],
  DocumentAction
> = () => ({

    updateDocumentOptimistically: async (id: string, content: string) => {
        try {
            await documentService.update(id, {
                content
            })
        } catch (error) {
            console.error('[updateDocumentOptimistically] Failed to sync to DB:', error);

        }
    
    }

})