import {
  buildFlatExcelArtifact,
  buildJsonArtifact,
  buildThreadedExcelArtifact
} from "./export-core/artifacts";
import { exportVideoComments } from "./export-core/export-comments";
import { createYouTubeDataClient, extractVideoId } from "./export-core/youtube";
import type { YouTubeClient } from "./export-core/types";
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
  const exportResult = {
    ...exported,
    order: input.order
  };
  const jsonArtifact = buildJsonArtifact(exportResult);
  const json = await dependencies.uploadArtifact(
    jsonArtifact.filename,
    jsonArtifact.content,
    jsonArtifact.contentType
  );
  const threadedExcelArtifact = buildThreadedExcelArtifact(exportResult);
  const threadedExcel = await dependencies.uploadArtifact(
    threadedExcelArtifact.filename,
    threadedExcelArtifact.content,
    threadedExcelArtifact.contentType
  );
  const flatExcelArtifact = buildFlatExcelArtifact(exportResult);
  const flatExcel = await dependencies.uploadArtifact(
    flatExcelArtifact.filename,
    flatExcelArtifact.content,
    flatExcelArtifact.contentType
  );

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
