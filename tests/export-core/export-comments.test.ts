import { describe, expect, it } from "vitest";
import { exportVideoComments } from "../../apps/web/lib/export-core/export-comments";

class FakeYouTubeClient {
  public commentsCalls: Array<{ parentId: string; pageToken?: string }> = [];

  async listCommentThreads(videoId: string, pageToken?: string, order = "relevance") {
    expect(videoId).toBe("video-1");
    expect(order).toBe("time");

    if (!pageToken) {
      return {
        items: [
          {
            id: "thread-1",
            snippet: {
              totalReplyCount: 2,
              topLevelComment: {
                id: "comment-1-parent",
                snippet: {
                  authorDisplayName: "@author-1",
                  publishedAt: "2026-04-01T00:00:00Z",
                  textDisplay: "thread text 1",
                  likeCount: 10
                }
              }
            },
            replies: {
              comments: [
                {
                  id: "reply-1",
                  snippet: {
                    authorDisplayName: "@reply-1",
                    publishedAt: "2026-04-01T00:05:00Z",
                    textDisplay: "reply one",
                    likeCount: 1,
                    parentId: "comment-1-parent"
                  }
                }
              ]
            }
          }
        ],
        nextPageToken: "page-2"
      };
    }

    return {
      items: [
        {
          id: "thread-2",
          snippet: {
            totalReplyCount: 0,
            topLevelComment: {
              id: "comment-2-parent",
              snippet: {
                authorDisplayName: "@author-2",
                publishedAt: "2026-04-02T00:00:00Z",
                textDisplay: "thread text 2",
                likeCount: 5
              }
            }
          }
        }
      ]
    };
  }

  async listCommentReplies(parentId: string, pageToken?: string) {
    this.commentsCalls.push({ parentId, pageToken });

    if (!pageToken) {
      return {
        items: [
          {
            id: "reply-2",
            snippet: {
              authorDisplayName: "@reply-2",
              publishedAt: "2026-04-01T00:06:00Z",
              textDisplay: "reply two",
              likeCount: 2,
              parentId: "comment-1-parent"
            }
          }
        ]
      };
    }

    return { items: [] };
  }
}

describe("exportVideoComments", () => {
  it("paginates threads and backfills replies", async () => {
    const client = new FakeYouTubeClient();

    const result = await exportVideoComments(client, "video-1", "time");

    expect(result.videoId).toBe("video-1");
    expect(result.summary.topLevelCommentCount).toBe(2);
    expect(result.summary.replyCount).toBe(2);
    expect(result.summary.totalCommentCount).toBe(4);
    expect(result.threads[0].replies.map((reply) => reply.commentId)).toEqual(["reply-1", "reply-2"]);
    expect(client.commentsCalls).toEqual([{ parentId: "comment-1-parent", pageToken: undefined }]);
  });
});
