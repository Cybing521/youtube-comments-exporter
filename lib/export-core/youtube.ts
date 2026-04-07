import type {
  CommentRepliesPayload,
  CommentThreadsPayload,
  SortOrder,
  YouTubeClient,
} from "./types";

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;

export function extractVideoId(urlOrVideoId: string): string {
  if (!urlOrVideoId.includes("youtube.com") && !urlOrVideoId.includes("youtu.be")) {
    return urlOrVideoId;
  }

  const parsed = new URL(urlOrVideoId);
  if (parsed.hostname.endsWith("youtu.be")) {
    return parsed.pathname.replace(/^\/+/, "");
  }

  const videoId = parsed.searchParams.get("v");
  if (videoId) {
    return videoId;
  }

  const [, kind, candidate] = parsed.pathname.split("/");
  if (candidate && ["shorts", "embed", "live"].includes(kind)) {
    return candidate;
  }

  throw new Error("无法从链接中提取视频 ID");
}

async function sleep(milliseconds: number) {
  await new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function readYouTubeApiError(response: Response) {
  try {
    const payload = (await response.json()) as {
      error?: {
        message?: string;
      };
    };

    return payload.error?.message;
  } catch {
    return undefined;
  }
}

async function requestJson(endpoint: string, params: Record<string, string>) {
  let attempt = 0;
  let lastError: Error | undefined;

  while (attempt < MAX_ATTEMPTS) {
    let response: Response;

    try {
      response = await fetch(`${endpoint}?${new URLSearchParams(params).toString()}`, {
        method: "GET",
        cache: "no-store",
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("YouTube API 请求失败");
      if (attempt >= MAX_ATTEMPTS - 1) {
        break;
      }

      await sleep(200 * 2 ** attempt);
      attempt += 1;
      continue;
    }

    if (response.ok) {
      return response.json();
    }

    const message = await readYouTubeApiError(response);
    lastError = new Error(
      message ? `YouTube API 请求失败：${response.status} ${message}` : `YouTube API 请求失败：${response.status}`,
    );

    const shouldRetry = RETRYABLE_STATUS_CODES.has(response.status) && attempt < MAX_ATTEMPTS - 1;
    if (!shouldRetry) {
      throw lastError;
    }

    await sleep(200 * 2 ** attempt);
    attempt += 1;
  }

  throw lastError ?? new Error("YouTube API 请求失败");
}

export function createYouTubeDataClient(apiKey: string): YouTubeClient {
  return {
    async validateApiKey(videoId: string): Promise<void> {
      const params: Record<string, string> = {
        part: "id",
        id: videoId,
        maxResults: "1",
        key: apiKey,
      };

      try {
        await requestJson("https://www.googleapis.com/youtube/v3/videos", params);
      } catch (error) {
        const message = error instanceof Error ? error.message : "YouTube API 请求失败";
        throw new Error(`YouTube API Key 不可用：${message}`);
      }
    },

    async listCommentThreads(
      videoId: string,
      pageToken?: string,
      order: SortOrder = "relevance",
    ): Promise<CommentThreadsPayload> {
      const params: Record<string, string> = {
        part: "snippet,replies",
        videoId,
        maxResults: "100",
        order,
        textFormat: "plainText",
        key: apiKey,
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      return requestJson("https://www.googleapis.com/youtube/v3/commentThreads", params);
    },

    async listCommentReplies(parentId: string, pageToken?: string): Promise<CommentRepliesPayload> {
      const params: Record<string, string> = {
        part: "snippet",
        parentId,
        maxResults: "100",
        textFormat: "plainText",
        key: apiKey,
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      return requestJson("https://www.googleapis.com/youtube/v3/comments", params);
    },
  };
}
