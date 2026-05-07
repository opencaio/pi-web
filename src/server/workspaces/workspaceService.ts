import { createHash } from "node:crypto";
import type { Project } from "../types.js";
import type { Workspace } from "../types.js";
import { discoverGitWorktrees, isGitRepository } from "./gitWorktreeDiscovery.js";

const idFor = (value: string) => createHash("sha1").update(value).digest("hex").slice(0, 12);

export class WorkspaceService {
  async list(project: Project): Promise<Workspace[]> {
    if (!(await isGitRepository(project.path))) {
      return [this.single(project)];
    }

    const worktrees = await discoverGitWorktrees(project.path);
    if (worktrees.length === 0) return [this.single(project)];

    return worktrees.map((worktree) => {
      const leafName = worktree.path.split("/").filter((part) => part !== "").at(-1);
      return {
        id: idFor(`${project.id}:${worktree.path}`),
        projectId: project.id,
        path: worktree.path,
        label: worktree.branch ?? (worktree.detached === true ? "detached" : leafName ?? worktree.path),
        ...(worktree.branch === undefined ? {} : { branch: worktree.branch }),
        isMain: worktree.path === project.path,
        isGitWorktree: true,
      };
    });
  }

  private single(project: Project): Workspace {
    return {
      id: idFor(`${project.id}:${project.path}`),
      projectId: project.id,
      path: project.path,
      label: project.name,
      isMain: true,
      isGitWorktree: false,
    };
  }
}
