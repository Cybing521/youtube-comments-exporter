import { buildExportArtifacts } from "../../../packages/export-core/src/artifacts";
import { exportVideoComments } from "../../../packages/export-core/src/export-comments";
import { createYouTubeDataClient, extractVideoId } from "../../../packages/export-core/src/youtube";
import type { YouTubeClient } from "../../../packages/export-core/src/types";
import { uploadArtifact, type UploadedArtifact } from "./blob";

export interface ExportJobInput {
  url: string;
  apiKey: string;
  order: "relevance" | "time";
}

export interface ExportJobResult {
  videoId: string;
  order: "relevance" | "time";
  summary: {
    topLevelCommentCount: number;
    replyCount: number;
    totalCommentCount: number;
  };
  files: {
    jsonUrl: string;
    threadedExcelUrl: string;
    flatExcelUrl: string;
  };
}

interface ExportServiceDependencies {
  createClient: (apiKey: string) => YouTubeClient;
  uploadArtifact: (filename: string, content: Buffer, contentType: string) => Promise<UploadedArtifact>;
}

const defaultDependencies: ExportServiceDependencies = {
  createClient: createYouTubeDataClient,
  uploadArtifact
};

export async function runExportAndUpload(
  input: ExportJobInput,
  dependencies: ExportServiceDependencies = defaultDependencies
): Promise<ExportJobResult> {
  const videoId = extractVideoId(input.url);
  const client = dependencies.createClient(input.apiKey);
  const exported = await exportVideoComments(client, videoId, input.order);
  const artifacts = await buildExportArtifacts({
    ...exported,
    order: input.order
  });

  const [json, threadedExcel, flatExcel] = await Promise.all([
    dependencies.uploadArtifact(
      artifacts.json.filename,
      artifacts.json.content,
      artifacts.json.contentType
    ),
    dependencies.uploadArtifact(
      artifacts.threadedExcel.filename,
      artifacts.threadedExcel.content,
      artifacts.threadedExcel.contentType
    ),
    dependencies.uploadArtifact(
      artifacts.flatExcel.filename,
      artifacts.flatExcel.content,
      artifacts.flatExcel.contentType
    )
  ]);

  return {
    videoId,
    order: input.order,
    summary: exported.summary,
    files: {
      jsonUrl: json.url,
      threadedExcelUrl: threadedExcel.url,
      flatExcelUrl: flatExcel.url
    }
  };
}
