import {
  buildFlatExcelArtifact,
  buildJsonArtifact,
  buildThreadedExcelArtifact
} from "./export-core/artifacts";
import { exportVideoComments } from "./export-core/export-comments";
import { createYouTubeDataClient, extractVideoId } from "./export-core/youtube";
import type { YouTubeClient } from "./export-core/types";
import {
  readExportCache,
  uploadArtifact,
  writeExportCache,
  type ExportCacheEntry,
  type UploadedArtifact,
} from "./blob";
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
  cache?: {
    hit: boolean;
    cachedAt?: string;
  };
}

interface ExportServiceDependencies {
  createClient: (apiKey: string) => YouTubeClient;
  uploadArtifact: (filename: string, content: Buffer, contentType: string) => Promise<UploadedArtifact>;
  readCache: (videoId: string, order: "relevance" | "time") => Promise<ExportCacheEntry | null>;
  writeCache: (entry: ExportCacheEntry) => Promise<unknown>;
}

interface RunExportOptions {
  onProgress?: (event: ExportProgressEvent) => void;
}

const defaultDependencies: ExportServiceDependencies = {
  createClient: createYouTubeDataClient,
  uploadArtifact,
  readCache: readExportCache,
  writeCache: writeExportCache,
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
    stage: "validating",
    title: "正在校验 API key",
    detail: "先确认这把 YouTube API key 可以正常访问官方接口。",
  });

  await client.validateApiKey(videoId);

  emitProgress({
    stage: "validating",
    title: "正在检查缓存结果",
    detail: "看看这个视频是否已经导出过可复用结果。",
  });

  let cached: ExportCacheEntry | null = null;

  try {
    cached = await dependencies.readCache(videoId, input.order);
  } catch {
    cached = null;
  }

  if (cached) {
    emitProgress({
      stage: "uploading-files",
      title: "已命中缓存结果",
      detail: "这个视频最近已经导出过，正在直接返回现成下载链接。",
    });

    return {
      videoId: cached.videoId,
      order: cached.order,
      summary: cached.summary,
      files: cached.files,
      cache: {
        hit: true,
        cachedAt: cached.cachedAt,
      },
    };
  }

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

  const result = {
    videoId,
    order: input.order,
    summary: exported.summary,
    files: {
      jsonUrl: json.url,
      threadedExcelUrl: threadedExcel.url,
      flatExcelUrl: flatExcel.url
    },
    cache: {
      hit: false,
    },
  };

  try {
    await dependencies.writeCache({
      ...result,
      cachedAt: new Date().toISOString(),
    });
  } catch {
    emitProgress({
      stage: "uploading-files",
      title: "下载结果已准备完成",
      detail: "缓存保存失败了，但这次导出结果已经可正常下载。",
    });
  }

  return result;
}
