import { FolderOpen } from "lucide-react";

export function ClientProjectsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold mb-2">No projects assigned</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        You do not have any projects linked to your contact account yet. When
        GETLAB adds you to a project, it will appear here for quotations,
        payments, and requests for information.
      </p>
    </div>
  );
}
