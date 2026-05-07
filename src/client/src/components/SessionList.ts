import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { SessionActivity, SessionInfo, SessionStatus } from "../api";
import { listStyles } from "./shared";

function sessionLabel(session: SessionInfo): string {
  if (session.name !== undefined && session.name !== "") return session.name;
  return session.firstMessage !== "" ? session.firstMessage : session.id.slice(0, 8);
}

@customElement("session-list")
export class SessionList extends LitElement {
  @property({ attribute: false }) sessions: SessionInfo[] = [];
  @property({ attribute: false }) statuses: Record<string, SessionStatus> = {};
  @property({ attribute: false }) activities: Record<string, SessionActivity> = {};
  @property({ attribute: false }) selected?: SessionInfo;
  @property({ type: Boolean }) canStart = false;
  @property({ attribute: false }) onSelect?: (session: SessionInfo) => void;
  @property({ attribute: false }) onStart?: () => void;

  override render() {
    return html`
      <section>
        <h2>Sessions <button ?disabled=${!this.canStart} @click=${() => this.onStart?.()}>+</button></h2>
        ${this.sessions.map((session) => html`
          <button class=${this.selected?.id === session.id ? "selected" : ""} @click=${() => this.onSelect?.(session)}>
            <span>${sessionLabel(session)}</span><small>${this.renderStatus(session)}${String(session.messageCount)} messages</small>
          </button>
        `)}
      </section>
    `;
  }

  private renderStatus(session: SessionInfo) {
    const status = this.statuses[session.id];
    const activity = this.activities[session.id];
    if (activity?.phase === "active") return `● ${activity.label} · `;
    if (status === undefined) return "";
    if (status.isStreaming) return "● streaming · ";
    if (status.isBashRunning) return "● bash · ";
    if (status.isCompacting) return "● compacting · ";
    if (status.pendingMessageCount > 0) return `● ${String(status.pendingMessageCount)} pending · `;
    return "";
  }

  static override styles = listStyles;
}
