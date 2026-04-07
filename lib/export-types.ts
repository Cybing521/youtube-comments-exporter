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

export interface ExportResponse {
  videoId: string;
  order: "relevance" | "time";
  summary: ExportSummary;
  files: ExportFiles;
}

export interface ExportRequestInput {
  url: string;
  order?: "relevance" | "time";
}
