import { describe, expect, it } from "vitest";
import { initialAppState, type AppState } from "../appState";
import type { Machine, Project, SessionInfo, Workspace } from "../api";
import { emptyMachineNavigationSnapshot, InMemoryMachineNavigationMemory, machineNavigationSnapshotFromState, routeFromMachineNavigationSnapshot } from "./machineNavigationMemory";

describe("InMemoryMachineNavigationMemory", () => {
  it("remembers independent navigation snapshots per machine", () => {
    const memory = new InMemoryMachineNavigationMemory();

    memory.remember({ machineId: "local", projectId: "local-project", surface: { selectedFilePath: "README.md" } });
    memory.remember({ machineId: "remote", projectId: "remote-project", workspaceId: "remote-workspace", sessionId: "remote-session", surface: {} });

    expect(memory.latest("local")?.projectId).toBe("local-project");
    expect(memory.latest("remote")?.workspaceId).toBe("remote-workspace");

    memory.forget("local");

    expect(memory.latest("local")).toBeUndefined();
    expect(memory.latest("remote")?.projectId).toBe("remote-project");
  });

  it("returns cloned snapshots so callers cannot mutate memory", () => {
    const memory = new InMemoryMachineNavigationMemory();

    memory.remember({ machineId: "local", surface: { selectedFilePath: "README.md" } });
    const snapshot = memory.latest("local");
    if (snapshot !== undefined) snapshot.surface.selectedFilePath = "changed.ts";

    expect(memory.latest("local")?.surface.selectedFilePath).toBe("README.md");
  });
});

describe("machineNavigationSnapshotFromState", () => {
  it("captures the selected machine location and workspace surface", () => {
    const state: AppState = {
      ...initialAppState(),
      selectedMachine: machine("remote"),
      selectedProject: project("project"),
      selectedWorkspace: workspace("workspace", "project"),
      selectedSession: session("session"),
      workspaceTool: "core:workspace.files",
      mainView: "core:workspace.files",
      selectedFilePath: "src/main.ts",
      selectedDiffPath: "README.md",
      selectedTerminalId: "terminal-1",
    };

    expect(machineNavigationSnapshotFromState(state)).toEqual({
      machineId: "remote",
      projectId: "project",
      workspaceId: "workspace",
      sessionId: "session",
      tool: "core:workspace.files",
      view: "core:workspace.files",
      surface: {
        selectedFilePath: "src/main.ts",
        selectedDiffPath: "README.md",
        selectedTerminalId: "terminal-1",
      },
    });
  });

  it("does not carry workspace surface without a selected workspace", () => {
    const state: AppState = {
      ...initialAppState(),
      selectedFilePath: "src/main.ts",
      selectedDiffPath: "README.md",
      selectedTerminalId: "terminal-1",
    };

    expect(machineNavigationSnapshotFromState(state).surface).toEqual({
      selectedFilePath: undefined,
      selectedDiffPath: undefined,
      selectedTerminalId: undefined,
    });
  });
});

describe("routeFromMachineNavigationSnapshot", () => {
  it("converts navigation snapshots to URL routes", () => {
    expect(routeFromMachineNavigationSnapshot({
      machineId: "remote",
      projectId: "project",
      workspaceId: "workspace",
      sessionId: "session",
      tool: "core:workspace.git",
      view: "navigation",
      surface: {},
    })).toEqual({
      machineId: "remote",
      projectId: "project",
      workspaceId: "workspace",
      sessionId: "session",
      tool: "core:workspace.git",
      view: undefined,
    });
  });

  it("creates an empty machine-only snapshot", () => {
    expect(emptyMachineNavigationSnapshot("remote")).toEqual({ machineId: "remote", surface: {} });
  });
});

function machine(id: string): Machine {
  return { id, name: id, kind: id === "local" ? "local" : "remote", createdAt: "now", updatedAt: "now" };
}

function project(id: string): Project {
  return { id, name: id, path: `/tmp/${id}`, createdAt: "now" };
}

function workspace(id: string, projectId: string): Workspace {
  return { id, projectId, path: `/tmp/${projectId}/${id}`, label: id, isMain: true, isGitRepo: true, isGitWorktree: false };
}

function session(id: string): SessionInfo {
  return { id, path: `/tmp/project/.pi/sessions/${id}`, cwd: "/tmp/project", created: "now", modified: "now", messageCount: 0, firstMessage: "" };
}
