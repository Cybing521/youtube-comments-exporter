export interface ExportSummary {
  topLevelCommentCount: number;
  replyCount: number;
  totalCommentCount: number;
}

export interface ExportFiles {
  jsonUrl: string;
  threadedExcelUrl: string;
  flatExcelUrl: string;
}

export type ExportProgressStage =
  | "validating"
  | "fetching-comments"
  | "hydrating-replies"
  | "building-files"
  | "uploading-files";

export interface ExportProgressEvent {
  stage: ExportProgressStage;
  title: string;
  detail: string;
}

export interface ExportResponse {
  videoId: string;
  order: "relevance" | "time";
  summary: ExportSummary;
  files: ExportFiles;
  cache?: {
    hit: boolean;
    cachedAt?: string;
  };
}

export interface ExportRequestInput {
  url: string;
  apiKey: string;
  turnstileToken: string;
  order?: "relevance" | "time";
}

export type ExportStreamEvent =
  | {
      type: "progress";
      progress: ExportProgressEvent;
    }
  | {
      type: "success";
      result: ExportResponse;
    }
  | {
      type: "error";
      error: string;
    };
