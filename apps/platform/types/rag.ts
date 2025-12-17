import { z } from 'zod';

import { ChatSemanticSearchChunk } from './chunk';

export const SemanticSearchSchema = z.object({
  fileIds: z.array(z.string()).optional(),
  model: z.string().optional(),
  rewriteQuery: z.string(),
  userQuery: z.string(),
});

export type SemanticSearchSchemaType = z.infer<typeof SemanticSearchSchema>;

export type MessageSemanticSearchChunk = Pick<ChatSemanticSearchChunk, 'id' | 'similarity'>;