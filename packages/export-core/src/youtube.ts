import type {
  CommentRepliesPayload,
  CommentThreadsPayload,
  SortOrder,
  YouTubeClient
} from "./types";

export function extractVideoId(urlOrVideoId: string): string {
  if (!urlOrVideoId.includes("youtube.com") && !urlOrVideoId.includes("youtu.be")) {
    return urlOrVideoId;
  }

  const parsed = new URL(urlOrVideoId);
  if (parsed.hostname.endsWith("youtu.be")) {
    return parsed.pathname.replace(/^\/+/, "");
  }

  const videoId = parsed.searchParams.get("v");
  if (!videoId) {
    throw new Error("无法从链接中提取视频 ID");
  }

  return videoId;
}

async function requestJson(endpoint: string, params: Record<string, string>) {
  const response = await fetch(`${endpoint}?${new URLSearchParams(params).toString()}`, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`YouTube API 请求失败：${response.status}`);
  }

  return response.json();
}

export function createYouTubeDataClient(apiKey: string): YouTubeClient {
  return {
    async listCommentThreads(
      videoId: string,
      pageToken?: string,
      order: SortOrder = "relevance"
    ): Promise<CommentThreadsPayload> {
      const params: Record<string, string> = {
        part: "snippet,replies",
        videoId,
        maxResults: "100",
        order,
        textFormat: "plainText",
        key: apiKey
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      return requestJson("https://www.googleapis.com/youtube/v3/commentThreads", params);
    },

    async listCommentReplies(
      parentId: string,
      pageToken?: string
    ): Promise<CommentRepliesPayload> {
      const params: Record<string, string> = {
        part: "snippet",
        parentId,
        maxResults: "100",
        textFormat: "plainText",
        key: apiKey
      };

      if (pageToken) {
        params.pageToken = pageToken;
      }

      return requestJson("https://www.googleapis.com/youtube/v3/comments", params);
    }
  };
}
