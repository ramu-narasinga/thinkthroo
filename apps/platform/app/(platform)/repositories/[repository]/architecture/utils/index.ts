
/* ===========
   Types
   =========== */
export type FlatRow = {
  id: string;
  repository_id?: number | string;
  parent_id: string | null;
  name: string;
  type: "file" | "folder";
  content?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type PageNodeClient = FlatRow & { children?: PageNodeClient[] };

/* ===========
   Helpers
   =========== */
export function buildTree(rows: FlatRow[]): PageNodeClient[] {
  const map = new Map<string, PageNodeClient>();
  const roots: PageNodeClient[] = [];
  for (const r of rows) map.set(r.id, { ...r, children: [] });

  for (const r of rows) {
    const node = map.get(r.id)!;
    if (r.parent_id) {
      const parent = map.get(r.parent_id);
      if (parent) parent.children!.push(node);
      else roots.push(node); // orphaned, treat as root
    } else roots.push(node);
  }

  const sortFn = (a: PageNodeClient, b: PageNodeClient) => {
    const ta = a.created_at ?? "";
    const tb = b.created_at ?? "";
    if (ta === tb) return a.name.localeCompare(b.name);
    return ta < tb ? -1 : 1;
  };

  const sortRec = (nodes: PageNodeClient[]) => {
    nodes.sort(sortFn);
    nodes.forEach((n) => n.children && sortRec(n.children));
  };

  sortRec(roots);
  return roots;
}
