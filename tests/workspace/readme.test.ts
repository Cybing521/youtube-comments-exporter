import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("README", () => {
  it("documents setup and deployment", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(readme).toContain("Features");
    expect(readme).toContain("Environment Variables");
    expect(readme).toContain("Local Development");
    expect(readme).toContain("Testing");
    expect(readme).toContain("Vercel Deployment");
  });
});
