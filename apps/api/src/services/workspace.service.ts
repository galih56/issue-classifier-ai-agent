import {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  type CreateWorkspaceParams
} from "@repo/database/repositories";

export async function createWorkspaceForUser(params: CreateWorkspaceParams) {
  // Validate input
  if (!params.name || params.name.trim().length === 0) {
    throw new Error("Workspace name is required");
  }

  // Create workspace
  const workspace = await createWorkspace({
    name: params.name.trim(),
    description: params.description?.trim(),
    creatorId: params.creatorId,
  });

  return workspace;
}

export async function getWorkspacesForUser(isAdmin: boolean, userId?: string) {
  if (isAdmin) {
    return await getWorkspaces();
  }
  return await getWorkspaces(userId);
}

export async function getWorkspace(id: string) {
  return await getWorkspaceById(id);
}

export async function updateWorkspaceById(id: string, params: Partial<CreateWorkspaceParams>) {
  return await updateWorkspace(id, {
    name: params.name?.trim(),
    description: params.description?.trim(),
  });
}

export async function deleteWorkspaceById(id: string) {
  return await deleteWorkspace(id);
}
