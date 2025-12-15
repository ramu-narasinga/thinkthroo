export interface ChunkDocument {
  compositeId?: string;
  id?: string;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  parentId?: string;
  text: string;
  type: string;
}