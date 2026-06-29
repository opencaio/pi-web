import { describe, expect, it } from "vitest";
import { parsePiWebComponentStatus, parsePiWebInstallationInfo, parsePiWebVersionResponse } from "./piWebStatusParsing.js";

describe("PI WEB shared status parsing", () => {
  it("parses Docker installation metadata", () => {
    expect(parsePiWebInstallationInfo({ kind: "docker", path: "/srv/pi-web-docker", dockerMode: "runtime" })).toEqual({
      kind: "docker",
      path: "/srv/pi-web-docker",
      dockerMode: "runtime",
    });
    expect(parsePiWebInstallationInfo({ kind: "docker", path: "/workspace/pi-web", dockerMode: "dev" })).toEqual({
      kind: "docker",
      path: "/workspace/pi-web",
      dockerMode: "dev",
    });
  });

  it("ignores invalid optional Docker modes without rejecting component status", () => {
    expect(parsePiWebComponentStatus({
      component: "web",
      label: "Web/UI",
      runtimeVersion: "1.0.0",
      stale: false,
      available: true,
      installation: { kind: "docker", path: "/workspace/pi-web", dockerMode: "hidden" },
    })?.installation).toEqual({ kind: "docker", path: "/workspace/pi-web" });
  });

  it("parses version responses that include Docker runtime and development components", () => {
    const parsed = parsePiWebVersionResponse({
      packageName: "@jmfederico/pi-web",
      generatedAt: "now",
      components: {
        web: { component: "web", label: "Web/UI", runtimeVersion: "1.0.0", stale: false, available: true, installation: { kind: "docker", path: "/srv/pi-web-docker", dockerMode: "runtime" } },
        sessiond: { component: "sessiond", label: "Session daemon", runtimeVersion: "1.0.0", stale: false, available: true, installation: { kind: "docker", path: "/workspace/pi-web", dockerMode: "dev" } },
      },
    });

    expect(parsed?.components.web.installation).toEqual({ kind: "docker", path: "/srv/pi-web-docker", dockerMode: "runtime" });
    expect(parsed?.components.sessiond.installation).toEqual({ kind: "docker", path: "/workspace/pi-web", dockerMode: "dev" });
  });
});
