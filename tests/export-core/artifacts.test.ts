import { describe, expect, it } from "vitest";
import { read, utils } from "xlsx";
import { buildExportArtifacts } from "../../lib/export-core/artifacts";

const sampleExport = {
  videoId: "video-1",
  order: "time" as const,
  summary: {
    topLevelCommentCount: 1,
    replyCount: 2,
    totalCommentCount: 3
  },
  threads: [
    {
      threadId: "thread-1",
      commentId: "comment-1",
      author: "@author",
      publishedAt: "2026-04-01T00:00:00Z",
      text: "top text",
      likeCount: 10,
      replyCount: 2,
      replies: [
        {
          commentId: "reply-1",
          parentId: "comment-1",
          author: "@reply-a",
          publishedAt: "2026-04-01T00:01:00Z",
          text: "reply a",
          likeCount: 1
        },
        {
          commentId: "reply-2",
          parentId: "comment-1",
          author: "@reply-b",
          publishedAt: "2026-04-01T00:02:00Z",
          text: "reply b",
          likeCount: 2
        }
      ]
    }
  ]
};

describe("buildExportArtifacts", () => {
  it("builds json and both excel artifacts", async () => {
    const artifacts = await buildExportArtifacts(sampleExport);

    expect(artifacts.json.filename).toBe("video-1.time.comments.json");
    expect(artifacts.threadedExcel.filename).toBe("video-1.time.comments.xlsx");
    expect(artifacts.flatExcel.filename).toBe("video-1.time.comments.flat.xlsx");

    const threadedWorkbook = read(artifacts.threadedExcel.content);
    expect(threadedWorkbook.SheetNames).toEqual(["Summary", "Threads", "Replies"]);

    const flatWorkbook = read(artifacts.flatExcel.content);
    expect(flatWorkbook.SheetNames).toEqual(["FlatComments"]);

    const flatSheet = flatWorkbook.Sheets.FlatComments;
    const rows = utils.sheet_to_json<(string | number)[]>(flatSheet, { header: 1 });
    expect(rows).toHaveLength(4);
    expect(rows[0][0]).toBe("level");
    expect(rows[1][0]).toBe("top");
    expect(rows[2][0]).toBe("reply");
    expect(rows[3][0]).toBe("reply");
  });
});
