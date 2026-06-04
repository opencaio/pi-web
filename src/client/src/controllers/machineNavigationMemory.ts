import type { AppState } from "../appState";
import { LOCAL_MACHINE_ID } from "../machineKeys";
import type { AppRoute } from "../route";

export interface WorkspaceRouteSurface {
  selectedFilePath?: string | undefined;
  selectedDiffPath?: string | undefined;
  selectedTerminalId?: string | undefined;
}

export interface MachineNavigationSnapshot {
  machineId: string;
  projectId?: string | undefined;
  workspaceId?: string | undefined;
  sessionId?: string | undefined;
  tool?: AppRoute["tool"];
  view?: AppState["mainView"] | undefined;
  surface: WorkspaceRouteSurface;
}

export interface MachineNavigationMemory {
  latest(machineId: string): MachineNavigationSnapshot | undefined;
  remember(snapshot: MachineNavigationSnapshot): void;
  forget(machineId: string): void;
}

export class InMemoryMachineNavigationMemory implements MachineNavigationMemory {
  private readonly snapshotsByMachine = new Map<string, MachineNavigationSnapshot>();

  latest(machineId: string): MachineNavigationSnapshot | undefined {
    const snapshot = this.snapshotsByMachine.get(machineId);
    return snapshot === undefined ? undefined : cloneSnapshot(snapshot);
  }

  remember(snapshot: MachineNavigationSnapshot): void {
    this.snapshotsByMachine.set(snapshot.machineId, cloneSnapshot(snapshot));
  }

  forget(machineId: string): void {
    this.snapshotsByMachine.delete(machineId);
  }
}

export function emptyMachineNavigationSnapshot(machineId: string): MachineNavigationSnapshot {
  return { machineId, surface: {} };
}

export function machineNavigationSnapshotFromState(state: AppState): MachineNavigationSnapshot {
  const hasWorkspace = state.selectedWorkspace !== undefined;
  return {
    machineId: state.selectedMachine?.id ?? LOCAL_MACHINE_ID,
    projectId: state.selectedProject?.id,
    workspaceId: state.selectedWorkspace?.id,
    sessionId: state.selectedSession?.id,
    tool: state.workspaceTool,
    view: state.mainView,
    surface: {
      selectedFilePath: hasWorkspace ? state.selectedFilePath : undefined,
      selectedDiffPath: hasWorkspace ? state.selectedDiffPath : undefined,
      selectedTerminalId: hasWorkspace ? state.selectedTerminalId : undefined,
    },
  };
}

export function routeFromMachineNavigationSnapshot(snapshot: MachineNavigationSnapshot): AppRoute {
  return {
    machineId: snapshot.machineId,
    projectId: snapshot.projectId,
    workspaceId: snapshot.workspaceId,
    sessionId: snapshot.sessionId,
    tool: snapshot.tool,
    view: snapshot.view === "navigation" ? undefined : snapshot.view,
  };
}

function cloneSnapshot(snapshot: MachineNavigationSnapshot): MachineNavigationSnapshot {
  return {
    ...snapshot,
    surface: { ...snapshot.surface },
  };
}
