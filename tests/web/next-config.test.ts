import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";

describe("next config", () => {
  it("keeps lint disabled during build and traces from the repo root", async () => {
    const repoRoot = process.cwd();

    process.chdir(repoRoot);
    vi.resetModules();

    const configUrl = `${pathToFileURL(path.resolve(repoRoot, "next.config.ts")).href}?next-config-test=${Date.now()}`;

    const { default: nextConfig } = await import(/* @vite-ignore */ configUrl);

    expect(nextConfig.eslint?.ignoreDuringBuilds).toBe(true);
    expect(nextConfig.outputFileTracingRoot).toBe(repoRoot);
    expect(nextConfig.experimental?.webpackBuildWorker).toBe(false);

    process.chdir(repoRoot);
  });
});
