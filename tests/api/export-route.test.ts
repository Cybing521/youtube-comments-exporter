import { afterEach, describe, expect, it } from "vitest";

const originalApiKey = process.env.YOUTUBE_API_KEY;

afterEach(() => {
  if (originalApiKey === undefined) {
    delete process.env.YOUTUBE_API_KEY;
  } else {
    process.env.YOUTUBE_API_KEY = originalApiKey;
  }
});

describe("POST /api/export", () => {
  it("returns export summary and blob urls with server-side api key", async () => {
    process.env.YOUTUBE_API_KEY = "AIza-server";
    const { handleExportRequest } = await import("../../lib/handle-export-request");

    const data = await handleExportRequest(
      {
        url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
        order: "time"
      },
      {
        exportArtifacts: async (input) => {
          expect(input.apiKey).toBe("AIza-server");

          return {
          videoId: "gtEROmL0NzQ",
          order: "time",
          summary: {
            topLevelCommentCount: 1504,
            replyCount: 1122,
            totalCommentCount: 2626
          },
          files: {
            jsonUrl: "https://blob.example.com/gtEROmL0NzQ.time.comments.json",
            threadedExcelUrl: "https://blob.example.com/gtEROmL0NzQ.time.comments.xlsx",
            flatExcelUrl: "https://blob.example.com/gtEROmL0NzQ.time.comments.flat.xlsx"
          }
        };
      }
      }
    );

    expect(data.videoId).toBe("gtEROmL0NzQ");
    expect(data.files.jsonUrl).toMatch(/^https?:\/\//);
    expect(data.files.threadedExcelUrl).toMatch(/^https?:\/\//);
    expect(data.files.flatExcelUrl).toMatch(/^https?:\/\//);
  });

  it("rejects missing url", async () => {
    process.env.YOUTUBE_API_KEY = "AIza-server";
    const { handleExportRequest } = await import("../../lib/handle-export-request");
    await expect(handleExportRequest({})).rejects.toThrow("缺少 YouTube 链接");
  });

  it("rejects missing server api key", async () => {
    delete process.env.YOUTUBE_API_KEY;
    const { handleExportRequest } = await import("../../lib/handle-export-request");
    await expect(
      handleExportRequest({
        url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
      }),
    ).rejects.toThrow("服务端未配置 YOUTUBE_API_KEY");
  });
});
