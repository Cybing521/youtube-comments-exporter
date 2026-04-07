import { utils, write, type WorkBook } from "xlsx";
import type { ExportResult } from "./types";

function toBuffer(workbook: WorkBook): Buffer {
  return write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;
}

export function buildThreadedWorkbook(exportResult: ExportResult): Buffer {
  const workbook = utils.book_new();

  const summaryRows = [
    ["video_id", exportResult.videoId],
    ["order", exportResult.order ?? ""],
    ["top_level_comment_count", exportResult.summary.topLevelCommentCount],
    ["reply_count", exportResult.summary.replyCount],
    ["total_comment_count", exportResult.summary.totalCommentCount],
  ];

  const threadRows = [
    ["thread_id", "comment_id", "author", "published_at", "like_count", "reply_count", "text"],
    ...exportResult.threads.map((thread) => [
      thread.threadId,
      thread.commentId,
      thread.author ?? "",
      thread.publishedAt ?? "",
      thread.likeCount,
      thread.replyCount,
      thread.text ?? "",
    ]),
  ];

  const replyRows = [
    ["thread_id", "parent_comment_id", "reply_comment_id", "author", "published_at", "like_count", "text"],
    ...exportResult.threads.flatMap((thread) =>
      thread.replies.map((reply) => [
        thread.threadId,
        thread.commentId,
        reply.commentId,
        reply.author ?? "",
        reply.publishedAt ?? "",
        reply.likeCount,
        reply.text ?? "",
      ]),
    ),
  ];

  utils.book_append_sheet(workbook, utils.aoa_to_sheet(summaryRows), "Summary");
  utils.book_append_sheet(workbook, utils.aoa_to_sheet(threadRows), "Threads");
  utils.book_append_sheet(workbook, utils.aoa_to_sheet(replyRows), "Replies");

  return toBuffer(workbook);
}

export function buildFlatWorkbook(exportResult: ExportResult): Buffer {
  const rows = [
    ["level", "thread_id", "comment_id", "parent_comment_id", "author", "published_at", "like_count", "reply_count", "text"],
    ...exportResult.threads.flatMap((thread) => [
      [
        "top",
        thread.threadId,
        thread.commentId,
        "",
        thread.author ?? "",
        thread.publishedAt ?? "",
        thread.likeCount,
        thread.replyCount,
        thread.text ?? "",
      ],
      ...thread.replies.map((reply) => [
        "reply",
        thread.threadId,
        reply.commentId,
        thread.commentId,
        reply.author ?? "",
        reply.publishedAt ?? "",
        reply.likeCount,
        "",
        reply.text ?? "",
      ]),
    ]),
  ];

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.aoa_to_sheet(rows), "FlatComments");
  return toBuffer(workbook);
}
