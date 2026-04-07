import { describe, expect, it } from "vitest";
import { runExportAndUpload } from "../../lib/export-service";
import type { SortOrder, YouTubeClient } from "../../lib/export-core/types";

class FakeYouTubeClient implements YouTubeClient {
  public validatedVideoIds: string[] = [];

  async validateApiKey(videoId: string) {
    this.validatedVideoIds.push(videoId);
  }

  async listCommentThreads(_videoId: string, _pageToken?: string, _order?: SortOrder) {
    return {
      items: [
        {
          id: "thread-1",
          snippet: {
            totalReplyCount: 0,
            topLevelComment: {
              id: "comment-1",
              snippet: {
                authorDisplayName: "@author",
                publishedAt: "2026-04-01T00:00:00Z",
                textDisplay: "top text",
                likeCount: 10
              }
            }
          }
        }
      ]
    };
  }

  async listCommentReplies() {
    return { items: [] };
  }
}

describe("runExportAndUpload", () => {
  it("exports artifacts and returns uploaded urls", async () => {
    const uploaded: string[] = [];
    const client = new FakeYouTubeClient();

    const result = await runExportAndUpload(
      {
        url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
        apiKey: "AIza-test",
        order: "time"
      },
      {
        createClient: () => client,
        uploadArtifact: async (filename) => {
          uploaded.push(filename);
          return {
            url: `https://blob.example.com/${filename}`,
            pathname: filename
          };
        },
        readCache: async () => null,
        writeCache: async () => undefined,
      }
    );

    expect(result.videoId).toBe("gtEROmL0NzQ");
    expect(result.summary.totalCommentCount).toBe(1);
    expect(client.validatedVideoIds).toEqual(["gtEROmL0NzQ"]);
    expect(result.cache).toEqual({ hit: false });
    expect(uploaded).toEqual([
      "gtEROmL0NzQ.time.comments.json",
      "gtEROmL0NzQ.time.comments.xlsx",
      "gtEROmL0NzQ.time.comments.flat.xlsx"
    ]);
    expect(result.files.flatExcelUrl).toBe(
      "https://blob.example.com/gtEROmL0NzQ.time.comments.flat.xlsx"
    );
  });

  it("returns cached results for the same video and order", async () => {
    const client = new FakeYouTubeClient();
    const result = await runExportAndUpload(
      {
        url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
        apiKey: "AIza-test",
        order: "time",
      },
      {
        createClient: () => client,
        uploadArtifact: async () => {
          throw new Error("should not upload when cache exists");
        },
        readCache: async () => ({
          videoId: "gtEROmL0NzQ",
          order: "time",
          summary: {
            topLevelCommentCount: 1504,
            replyCount: 1122,
            totalCommentCount: 2626,
          },
          files: {
            jsonUrl: "https://blob.example.com/cached.json",
            threadedExcelUrl: "https://blob.example.com/cached.xlsx",
            flatExcelUrl: "https://blob.example.com/cached.flat.xlsx",
          },
          cachedAt: "2026-04-07T00:00:00.000Z",
        }),
        writeCache: async () => undefined,
      },
    );

    expect(client.validatedVideoIds).toEqual(["gtEROmL0NzQ"]);
    expect(result.files.jsonUrl).toBe("https://blob.example.com/cached.json");
    expect(result.summary.totalCommentCount).toBe(2626);
    expect(result.cache).toEqual({
      hit: true,
      cachedAt: "2026-04-07T00:00:00.000Z",
    });
  });
});
