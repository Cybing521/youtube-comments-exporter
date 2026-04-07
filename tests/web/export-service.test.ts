import { describe, expect, it } from "vitest";
import { runExportAndUpload } from "../../apps/web/lib/export-service";
import type { SortOrder, YouTubeClient } from "../../apps/web/lib/export-core/types";

class FakeYouTubeClient implements YouTubeClient {
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

    const result = await runExportAndUpload(
      {
        url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
        apiKey: "AIza-test",
        order: "time"
      },
      {
        createClient: () => new FakeYouTubeClient(),
        uploadArtifact: async (filename) => {
          uploaded.push(filename);
          return {
            url: `https://blob.example.com/${filename}`,
            pathname: filename
          };
        }
      }
    );

    expect(result.videoId).toBe("gtEROmL0NzQ");
    expect(result.summary.totalCommentCount).toBe(1);
    expect(uploaded).toEqual([
      "gtEROmL0NzQ.time.comments.json",
      "gtEROmL0NzQ.time.comments.xlsx",
      "gtEROmL0NzQ.time.comments.flat.xlsx"
    ]);
    expect(result.files.flatExcelUrl).toBe(
      "https://blob.example.com/gtEROmL0NzQ.time.comments.flat.xlsx"
    );
  });
});
