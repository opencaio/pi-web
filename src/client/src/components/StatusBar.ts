import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { SessionActivity, SessionStatus, Workspace } from "../api";
import { formatCost, formatTokenCount } from "../utils/format";
import { statusBarStyles } from "./shared";

@customElement("status-bar")
export class StatusBar extends LitElement {
  @property({ attribute: false }) status?: SessionStatus;
  @property({ attribute: false }) activity?: SessionActivity;
  @property({ attribute: false }) workspace?: Workspace;

  override render() {
    const status = this.status;
    if (status === undefined) return html`<div class="bar muted">No session status yet</div>`;
    const model = status.model?.id ?? "no model";
    const provider = status.model?.provider !== undefined && status.model.provider !== "" ? `${status.model.provider}/` : "";
    const state = status.isCompacting ? "compacting" : status.isBashRunning ? "bash" : status.isStreaming ? "running" : status.pendingMessageCount > 0 ? "queued" : "idle";
    const active = state !== "idle" || this.activity?.phase === "active";
    const context = status.contextUsage;
    const contextText = context
      ? context.percent == null
        ? `context ${formatTokenCount(context.contextWindow)}`
        : `${context.percent.toFixed(1)}%/${formatTokenCount(context.contextWindow)}`
      : "context unknown";
    const tokens = status.tokens;
    return html`
      <div class="bar">
        <span title=${this.workspace?.path ?? ""}>${this.workspace?.label ?? "workspace"}</span>
        <span class=${active ? "activity active" : "activity"}><span class="dot"></span>${this.activityText(state)}</span>
        <span>${provider}${model}</span>
        <span>thinking ${status.thinkingLevel ?? "off"}</span>
        <span>↑${formatTokenCount(tokens.input)}</span>
        <span>↓${formatTokenCount(tokens.output)}</span>
        <span>${contextText}</span>
        <span>${formatCost(status.cost)}</span>
        ${status.pendingMessageCount > 0 ? html`<span>${String(status.pendingMessageCount)} queued</span>` : null}
      </div>
    `;
  }

  private activityText(state: string): string {
    const activity = this.activity;
    if (activity === undefined) return state;
    if (state !== "idle" && activity.phase === "idle") return state;
    return activity.detail !== undefined && activity.detail !== "" ? `${activity.label}: ${activity.detail}` : activity.label;
  }

  static override styles = statusBarStyles;
}
