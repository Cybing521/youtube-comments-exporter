import { describe, expect, it, vi } from "vitest";

describe("POST /api/export", () => {
  it("returns export summary and blob urls when user api key and turnstile verification succeed", async () => {
    const { handleExportRequest } = await import("../../lib/handle-export-request");
    const verifyTurnstile = vi.fn(async () => ({
      success: true,
      hostname: "www.cybing.top"
    }));

    const data = await handleExportRequest(
      {
        url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
        apiKey: "AIza-user",
        turnstileToken: "turnstile-token",
        order: "time"
      },
      {
        verifyTurnstile,
        exportArtifacts: async (input) => {
          expect(input.apiKey).toBe("AIza-user");

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

    expect(verifyTurnstile).toHaveBeenCalledWith("turnstile-token");
    expect(data.videoId).toBe("gtEROmL0NzQ");
    expect(data.files.jsonUrl).toMatch(/^https?:\/\//);
    expect(data.files.threadedExcelUrl).toMatch(/^https?:\/\//);
    expect(data.files.flatExcelUrl).toMatch(/^https?:\/\//);
  });

  it("rejects missing url", async () => {
    const { handleExportRequest } = await import("../../lib/handle-export-request");
    await expect(handleExportRequest({})).rejects.toThrow("缺少 YouTube 链接");
  });

  it("rejects missing user api key", async () => {
    const { handleExportRequest } = await import("../../lib/handle-export-request");
    await expect(
      handleExportRequest({
        url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
        turnstileToken: "turnstile-token"
      })
    ).rejects.toThrow("请输入 YouTube API Key");
  });

  it("rejects missing turnstile token", async () => {
    const { handleExportRequest } = await import("../../lib/handle-export-request");
    await expect(
      handleExportRequest({
        url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
        apiKey: "AIza-user"
      })
    ).rejects.toThrow("请先完成人机验证");
  });

  it("rejects failed turnstile verification", async () => {
    const { handleExportRequest } = await import("../../lib/handle-export-request");
    await expect(
      handleExportRequest({
        url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
        apiKey: "AIza-user",
        turnstileToken: "turnstile-token"
      },
      {
        verifyTurnstile: async () => ({
          success: false,
          "error-codes": ["invalid-input-response"]
        }),
        exportArtifacts: async () => {
          throw new Error("should not run");
        }
      })
    ).rejects.toThrow("人机验证未通过，请重试");
  });

  it("rejects turnstile hostname mismatch", async () => {
    const { handleExportRequest } = await import("../../lib/handle-export-request");
    await expect(
      handleExportRequest(
        {
          url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
          apiKey: "AIza-user",
          turnstileToken: "turnstile-token"
        },
        {
          verifyTurnstile: async () => ({
            success: true,
            hostname: "evil.example.com"
          }),
          exportArtifacts: async () => {
            throw new Error("should not run");
          }
        },
        {
          expectedHostname: "www.cybing.top"
        }
      )
    ).rejects.toThrow("人机验证主机名不匹配，请刷新后重试");
  });

  it("streams an error event when turnstile upstream verification is unavailable", async () => {
    vi.resetModules();
    vi.doMock("../../lib/handle-export-request", () => ({
      handleExportRequest: async () => {
        throw new Error("人机验证服务暂时不可用，请稍后再试");
      }
    }));

    const { POST } = await import("../../app/api/export/route");
    const response = await POST(
      new Request("https://www.cybing.top/api/export", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
          apiKey: "AIza-user",
          turnstileToken: "turnstile-token"
        })
      })
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain("人机验证服务暂时不可用，请稍后再试");

    vi.doUnmock("../../lib/handle-export-request");
    vi.resetModules();
  });

  it("streams progress and success events from the export route", async () => {
    vi.resetModules();
    vi.doMock("../../lib/handle-export-request", () => ({
      handleExportRequest: async (_body: unknown, _dependencies: unknown, options?: { onProgress?: (event: unknown) => void }) => {
        options?.onProgress?.({
          stage: "fetching-comments",
          title: "正在请求评论数据",
          detail: "已获取第 1 页评论线程，继续向后补齐。"
        });

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
    }));

    const { POST } = await import("../../app/api/export/route");
    const response = await POST(
      new Request("https://www.cybing.top/api/export", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
          apiKey: "AIza-user",
          turnstileToken: "turnstile-token"
        })
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/plain");

    const body = await response.text();
    const events = body
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line) as { type: string; progress?: { title: string }; result?: { videoId: string } });

    expect(events[0]).toMatchObject({
      type: "progress",
      progress: {
        title: "正在请求评论数据"
      }
    });
    expect(events[1]).toMatchObject({
      type: "success",
      result: {
        videoId: "gtEROmL0NzQ"
      }
    });

    vi.doUnmock("../../lib/handle-export-request");
    vi.resetModules();
  });
});
