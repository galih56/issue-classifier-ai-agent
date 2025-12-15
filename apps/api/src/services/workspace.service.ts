import { createWorkspace, type CreateWorkspaceParams } from "@repo/database/repositories";

export async function createWorkspaceForUser(params: CreateWorkspaceParams) {
  // Validate input
  if (!params.name || params.name.trim().length === 0) {
    throw new Error("Workspace name is required");
  }

  // Create workspace
  const workspace = await createWorkspace({
    name: params.name.trim(),
    description: params.description?.trim(),
  });

  return workspace;
}
