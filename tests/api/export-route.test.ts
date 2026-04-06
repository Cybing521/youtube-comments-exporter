import { describe, expect, it } from "vitest";

describe("POST /api/export", () => {
  it("returns export summary and blob urls", async () => {
    const { handleExportRequest } = await import("../../apps/web/lib/export-request");

    const data = await handleExportRequest(
      {
        url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
        apiKey: "AIza-test",
        order: "time"
      },
      {
        exportArtifacts: async () => ({
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
        })
      }
    );

    expect(data.videoId).toBe("gtEROmL0NzQ");
    expect(data.files.jsonUrl).toMatch(/^https?:\/\//);
    expect(data.files.threadedExcelUrl).toMatch(/^https?:\/\//);
    expect(data.files.flatExcelUrl).toMatch(/^https?:\/\//);
  });

  it("rejects missing url", async () => {
    const { handleExportRequest } = await import("../../apps/web/lib/export-request");
    await expect(handleExportRequest({})).rejects.toThrow("缺少 YouTube 链接");
  });
});
