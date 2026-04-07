import {
  buildFlatExcelArtifact,
  buildJsonArtifact,
  buildThreadedExcelArtifact
} from "./export-core/artifacts";
import { exportVideoComments } from "./export-core/export-comments";
import { createYouTubeDataClient, extractVideoId } from "./export-core/youtube";
import type { YouTubeClient } from "./export-core/types";
import { uploadArtifact, type UploadedArtifact } from "./blob";
import type { ExportProgressEvent } from "./export-types";

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

interface RunExportOptions {
  onProgress?: (event: ExportProgressEvent) => void;
}

const defaultDependencies: ExportServiceDependencies = {
  createClient: createYouTubeDataClient,
  uploadArtifact
};

export async function runExportAndUpload(
  input: ExportJobInput,
  dependencies: ExportServiceDependencies = defaultDependencies,
  options: RunExportOptions = {},
): Promise<ExportJobResult> {
  const emitProgress = options.onProgress ?? (() => undefined);
  const videoId = extractVideoId(input.url);
  const client = dependencies.createClient(input.apiKey);

  emitProgress({
    stage: "fetching-comments",
    title: "正在请求评论数据",
    detail: "开始获取一级评论线程。",
  });

  const exported = await exportVideoComments(client, videoId, input.order, {
    onFetchingPage: (pageNumber) => {
      emitProgress({
        stage: "fetching-comments",
        title: "正在请求评论数据",
        detail: `已获取第 ${pageNumber} 页评论线程，继续向后补齐。`,
      });
    },
    onHydratingReplies: (completedThreads, totalThreads) => {
      emitProgress({
        stage: "hydrating-replies",
        title: "正在补全回复内容",
        detail:
          totalThreads > 0
            ? `正在补全当前批次回复：${completedThreads}/${totalThreads}。`
            : "正在检查并补全回复内容。",
      });
    },
  });
  const exportResult = {
    ...exported,
    order: input.order
  };

  emitProgress({
    stage: "building-files",
    title: "正在生成导出文件",
    detail: "开始整理 JSON、分层 Excel 和扁平 Excel。",
  });
  const jsonArtifact = buildJsonArtifact(exportResult);
  emitProgress({
    stage: "building-files",
    title: "正在生成导出文件",
    detail: "JSON 已准备好，继续生成 Excel 文件。",
  });
  const json = await dependencies.uploadArtifact(
    jsonArtifact.filename,
    jsonArtifact.content,
    jsonArtifact.contentType
  );

  emitProgress({
    stage: "uploading-files",
    title: "正在准备下载结果",
    detail: "JSON 已上传，继续准备 Excel 下载链接。",
  });

  const threadedExcelArtifact = buildThreadedExcelArtifact(exportResult);
  const threadedExcel = await dependencies.uploadArtifact(
    threadedExcelArtifact.filename,
    threadedExcelArtifact.content,
    threadedExcelArtifact.contentType
  );

  emitProgress({
    stage: "uploading-files",
    title: "正在准备下载结果",
    detail: "分层 Excel 已上传，继续准备扁平 Excel。",
  });

  const flatExcelArtifact = buildFlatExcelArtifact(exportResult);
  const flatExcel = await dependencies.uploadArtifact(
    flatExcelArtifact.filename,
    flatExcelArtifact.content,
    flatExcelArtifact.contentType
  );

  emitProgress({
    stage: "uploading-files",
    title: "正在准备下载结果",
    detail: "三个文件都已上传完成，正在整理最终下载入口。",
  });

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
