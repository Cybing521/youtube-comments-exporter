import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("workspace bootstrap", () => {
  it("defines the core project files", () => {
    expect(existsSync("package.json")).toBe(true);
    expect(existsSync("pnpm-workspace.yaml")).toBe(true);
    expect(existsSync("README.md")).toBe(true);
    expect(existsSync(".gitignore")).toBe(true);
  });

  it("exposes web lifecycle scripts", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.scripts.dev).toBeTruthy();
    expect(pkg.scripts.build).toBeTruthy();
    expect(pkg.scripts.test).toBeTruthy();
  });
});
