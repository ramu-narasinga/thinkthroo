"use client";
import { Settings } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@thinkthroo/ui/components/button";
import { useUmami } from "@/hooks/use-umami";
import { Badge } from "@thinkthroo/ui/components/badge";
import { DataTableColumnHeader } from "@/components/data-table-column-header";
import Link from "next/link";

export type Repo = {
  id: string;
  githubRepoId: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch: string | null;
  private: boolean;
  installationId: string;
  organizationId: string;
  userId: string | null;
  hasAccess: boolean;
  lastSyncedAt: Date | null;
  removedAt: Date | null;
};

function ConfigureRepoButton({ repoName, hasAccess }: { repoName: string; hasAccess: boolean }) {
  const { track } = useUmami();
  return (
    <Link href={`/repositories/${repoName}`}>
      <Button
        variant="outline"
        size="sm"
        className="ml-auto hidden h-8 lg:flex"
        disabled={!hasAccess}
        onClick={() =>
          track("repositories_configure_clicked", {
            repo: repoName,
          })
        }
      >
        <Settings className="mr-2 h-4 w-4" />
        Configure
      </Button>
    </Link>
  );
}

export const columns: ColumnDef<Repo>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Repositories" />
    ),
    cell: ({ row }) => {
      const hasAccess = row.original.hasAccess;
      return (
        <div className="flex items-center gap-2">
          <span>{row.getValue("name")}</span>
          {!hasAccess && (
            <Badge variant="destructive" className="text-xs">
              No Access
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "private",
    header: "Visibility",
    cell: ({ row }) => {
      const isPrivate = row.getValue("private");
      return isPrivate ? "Private" : "Public";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ConfigureRepoButton repoName={row.original.name} hasAccess={row.original.hasAccess} />
    ),
  },
];
