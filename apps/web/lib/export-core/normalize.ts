import type { Reply, Thread } from "./types";

export function normalizeReply(replyItem: any): Reply {
  const snippet = replyItem.snippet ?? {};

  return {
    commentId: replyItem.id,
    parentId: snippet.parentId,
    author: snippet.authorDisplayName,
    publishedAt: snippet.publishedAt,
    text: snippet.textDisplay,
    likeCount: snippet.likeCount ?? 0,
  };
}

export function normalizeThread(threadItem: any): Thread {
  const snippet = threadItem.snippet ?? {};
  const topLevel = snippet.topLevelComment?.snippet ?? {};
  const embeddedReplies = (threadItem.replies?.comments ?? []).map(normalizeReply);

  return {
    threadId: threadItem.id,
    commentId: snippet.topLevelComment?.id,
    author: topLevel.authorDisplayName,
    publishedAt: topLevel.publishedAt,
    text: topLevel.textDisplay,
    likeCount: topLevel.likeCount ?? 0,
    replyCount: snippet.totalReplyCount ?? 0,
    replies: embeddedReplies,
  };
}
