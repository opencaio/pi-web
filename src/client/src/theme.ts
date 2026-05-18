import type { QualifiedContributionId, QualifiedThemeContribution, ThemeToken } from "./plugins/types";

export const DEFAULT_THEME_ID: QualifiedContributionId = "themes:current";
export const THEME_STORAGE_KEY = "pi-web-app-theme";

export const THEME_TOKENS: ThemeToken[] = [
  "--pi-bg",
  "--pi-surface",
  "--pi-surface-hover",
  "--pi-terminal-bg",
  "--pi-terminal-text",
  "--pi-border",
  "--pi-border-muted",
  "--pi-text",
  "--pi-text-secondary",
  "--pi-text-bright",
  "--pi-muted",
  "--pi-dim",
  "--pi-accent",
  "--pi-accent-border",
  "--pi-selection-bg",
  "--pi-success",
  "--pi-success-border",
  "--pi-success-bg",
  "--pi-success-surface",
  "--pi-success-ring",
  "--pi-warning",
  "--pi-warning-border",
  "--pi-warning-surface",
  "--pi-danger",
  "--pi-purple",
  "--pi-purple-border",
  "--pi-purple-surface",
  "--pi-overlay",
  "--pi-shadow-soft",
  "--pi-shadow",
  "--pi-shadow-strong",
  "--pi-bg-overlay-soft",
  "--pi-bg-overlay",
  "--pi-success-bg-overlay",
  "--pi-terminal-selection",
];

const qualifiedContributionIdPattern = /^[a-z][a-z0-9.-]*:[a-z][a-z0-9.-]*$/u;

export function readStoredThemeId(): QualifiedContributionId | undefined {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isQualifiedContributionId(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function applyPiWebTheme(theme: QualifiedThemeContribution, options: { persist?: boolean } = {}): void {
  const root = document.documentElement;
  root.dataset["piWebTheme"] = theme.id;
  root.style.colorScheme = theme.colorScheme;
  for (const token of THEME_TOKENS) {
    const value = theme.tokens[token];
    if (typeof value === "string" && value !== "") root.style.setProperty(token, value);
    else root.style.removeProperty(token);
  }
  if (options.persist === false) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme.id);
  } catch {
    // Ignore storage failures; the selected theme can still apply for this tab.
  }
}

function isQualifiedContributionId(value: string | null): value is QualifiedContributionId {
  return value !== null && qualifiedContributionIdPattern.test(value);
}
