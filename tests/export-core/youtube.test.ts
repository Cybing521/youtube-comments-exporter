import { afterEach, describe, expect, it, vi } from "vitest";
import { createYouTubeDataClient } from "../../lib/export-core/youtube";

describe("createYouTubeDataClient.validateApiKey", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("maps invalid keys to a friendly message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: {
              message: "API key not valid. Please pass a valid API key.",
            },
          }),
          { status: 400, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const client = createYouTubeDataClient("AIza-test");

    await expect(client.validateApiKey("gtEROmL0NzQ")).rejects.toThrow(
      "YouTube API Key 不可用：这把 YouTube API key 看起来无效，请检查是否粘贴完整。",
    );
  });

  it("maps disabled api projects to a friendly message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: {
              message: "AccessNotConfigured: YouTube Data API v3 has not been used in project 123 before or it is disabled.",
            },
          }),
          { status: 403, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const client = createYouTubeDataClient("AIza-test");

    await expect(client.validateApiKey("gtEROmL0NzQ")).rejects.toThrow(
      "YouTube API Key 不可用：这个 Google Cloud 项目还没有启用 YouTube Data API v3。",
    );
  });

  it("maps exhausted quota to a friendly message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: {
              message: "quotaExceeded: The request cannot be completed because you have exceeded your quota.",
            },
          }),
          { status: 403, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const client = createYouTubeDataClient("AIza-test");

    await expect(client.validateApiKey("gtEROmL0NzQ")).rejects.toThrow(
      "YouTube API Key 不可用：这把 YouTube API key 今日配额已经用完了，请明天再试或换一个项目的 key。",
    );
  });
});
