import { normalizeReply, normalizeThread } from "./normalize";
import type { ExportResult, Reply, SortOrder, YouTubeClient } from "./types";

const REPLY_FETCH_CONCURRENCY = 4;

interface ExportVideoCommentsOptions {
  onFetchingPage?: (pageNumber: number) => void;
  onHydratingReplies?: (completedThreads: number, totalThreads: number) => void;
}

async function fetchMissingReplies(
  client: YouTubeClient,
  parentCommentId: string,
  existingReplies: Reply[],
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

async function fillMissingReplies(
  client: YouTubeClient,
  threads: ExportResult["threads"],
  onProgress?: (completedThreads: number, totalThreads: number) => void,
) {
  let index = 0;
  let completedThreads = 0;

  async function worker() {
    while (index < threads.length) {
      const currentIndex = index;
      index += 1;
      const thread = threads[currentIndex];

      if (thread.replyCount > thread.replies.length) {
        thread.replies = await fetchMissingReplies(client, thread.commentId, thread.replies);
      }

      completedThreads += 1;
      onProgress?.(completedThreads, threads.length);
    }
  }

  const workerCount = Math.min(REPLY_FETCH_CONCURRENCY, threads.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
}

export async function exportVideoComments(
  client: YouTubeClient,
  videoId: string,
  order: SortOrder = "relevance",
  options: ExportVideoCommentsOptions = {},
): Promise<ExportResult> {
  const threads = [];
  let pageToken: string | undefined;
  let pageNumber = 0;

  while (true) {
    pageNumber += 1;
    options.onFetchingPage?.(pageNumber);
    const payload = await client.listCommentThreads(videoId, pageToken, order);
    const pageThreads = (payload.items ?? []).map((item) => normalizeThread(item));

    options.onHydratingReplies?.(0, pageThreads.length);
    await fillMissingReplies(client, pageThreads, options.onHydratingReplies);
    threads.push(...pageThreads);

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
      totalCommentCount: threads.length + replyCount,
    },
    threads,
  };
}
