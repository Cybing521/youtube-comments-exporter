import { runExportAndUpload, type ExportJobInput, type ExportJobResult } from "./export-service";

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
  apiKey: string;
  order?: "relevance" | "time";
}

interface ExportRouteDependencies {
  exportArtifacts: (input: ExportJobInput) => Promise<ExportJobResult>;
}

const defaultDependencies: ExportRouteDependencies = {
  exportArtifacts: runExportAndUpload,
};

export async function handleExportRequest(
  body: Partial<ExportRequestInput>,
  dependencies: ExportRouteDependencies = defaultDependencies,
): Promise<ExportResponse> {
  if (!body.url?.trim()) {
    throw new Error("缺少 YouTube 链接");
  }

  if (!body.apiKey?.trim()) {
    throw new Error("缺少 API 密钥");
  }

  return dependencies.exportArtifacts({
    url: body.url.trim(),
    apiKey: body.apiKey.trim(),
    order: body.order ?? "time",
  });
}

export async function submitExportRequest(input: ExportRequestInput): Promise<ExportResponse> {
  const response = await fetch("/api/export", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ...input,
      order: input.order ?? "time",
    }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "导出失败");
  }

  return response.json() as Promise<ExportResponse>;
}
