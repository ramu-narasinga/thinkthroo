import { ArchitectureDocument } from '@/types/document';

export interface DocumentState {
  documents: ArchitectureDocument[];
  isDocumentListLoading: boolean;
}

export const initialDocumentState: DocumentState = {
  documents: [],
  isDocumentListLoading: false,
};