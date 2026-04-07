import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("workspace bootstrap", () => {
  it("defines the core project files", () => {
    expect(existsSync("package.json")).toBe(true);
    expect(existsSync("README.md")).toBe(true);
    expect(existsSync(".gitignore")).toBe(true);
    expect(existsSync("app")).toBe(true);
    expect(existsSync("lib")).toBe(true);
  });

  it("exposes web lifecycle scripts", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.scripts.dev).toBeTruthy();
    expect(pkg.scripts.build).toBeTruthy();
    expect(pkg.scripts.test).toBeTruthy();
  });

  it("keeps the Next.js app at the repository root for Vercel", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));

    expect(existsSync("app/page.tsx")).toBe(true);
    expect(existsSync("app/layout.tsx")).toBe(true);
    expect(existsSync("next.config.ts")).toBe(true);
    expect(existsSync("app/global-error.tsx")).toBe(false);
    expect(pkg.scripts.dev).toBe("next dev");
    expect(pkg.scripts.build).toBe("next build");
  });
});
