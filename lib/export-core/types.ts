export type SortOrder = "relevance" | "time";

export interface Reply {
  commentId: string;
  parentId?: string;
  author?: string;
  publishedAt?: string;
  text?: string;
  likeCount: number;
}

export interface Thread {
  threadId: string;
  commentId: string;
  author?: string;
  publishedAt?: string;
  text?: string;
  likeCount: number;
  replyCount: number;
  replies: Reply[];
}

export interface ExportSummary {
  topLevelCommentCount: number;
  replyCount: number;
  totalCommentCount: number;
}

export interface ExportResult {
  videoId: string;
  order?: SortOrder;
  summary: ExportSummary;
  threads: Thread[];
}

export interface BinaryArtifact {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface ExportArtifacts {
  json: BinaryArtifact;
  threadedExcel: BinaryArtifact;
  flatExcel: BinaryArtifact;
}

export interface CommentThreadsPayload {
  items?: Array<Record<string, unknown>>;
  nextPageToken?: string;
}

export interface CommentRepliesPayload {
  items?: Array<Record<string, unknown>>;
  nextPageToken?: string;
}

export interface YouTubeClient {
  validateApiKey(videoId: string): Promise<void>;
  listCommentThreads(
    videoId: string,
    pageToken?: string,
    order?: SortOrder,
  ): Promise<CommentThreadsPayload>;
  listCommentReplies(parentId: string, pageToken?: string): Promise<CommentRepliesPayload>;
}
