import { normalizeReply, normalizeThread } from "./normalize";
import type { ExportResult, Reply, SortOrder, YouTubeClient } from "./types";

async function fetchMissingReplies(
  client: YouTubeClient,
  parentCommentId: string,
  existingReplies: Reply[]
): Promise<Reply[]> {
  const seenIds = new Set(existingReplies.map((reply) => reply.commentId));
  const replies = [...existingReplies];
  let pageToken: string | undefined;

  while (true) {
    const payload = await client.listCommentReplies(parentCommentId, pageToken);

    for (const item of payload.items ?? []) {
      const normalized = normalizeReply(item);
      if (!seenIds.has(normalized.commentId)) {
        replies.push(normalized);
        seenIds.add(normalized.commentId);
      }
    }

    pageToken = payload.nextPageToken;
    if (!pageToken) {
      break;
    }
  }

  replies.sort((left, right) => {
    const leftKey = `${left.publishedAt ?? ""}:${left.commentId}`;
    const rightKey = `${right.publishedAt ?? ""}:${right.commentId}`;
    return leftKey.localeCompare(rightKey);
  });

  return replies;
}

export async function exportVideoComments(
  client: YouTubeClient,
  videoId: string,
  order: SortOrder = "relevance"
): Promise<ExportResult> {
  const threads = [];
  let pageToken: string | undefined;

  while (true) {
    const payload = await client.listCommentThreads(videoId, pageToken, order);

    for (const item of payload.items ?? []) {
      const normalized = normalizeThread(item);

      if (normalized.replyCount > normalized.replies.length) {
        normalized.replies = await fetchMissingReplies(client, normalized.commentId, normalized.replies);
      }

      threads.push(normalized);
    }

    pageToken = payload.nextPageToken;
    if (!pageToken) {
      break;
    }
  }

  const replyCount = threads.reduce((total, thread) => total + thread.replies.length, 0);

  return {
    videoId,
    summary: {
      topLevelCommentCount: threads.length,
      replyCount,
      totalCommentCount: threads.length + replyCount
    },
    threads
  };
}
