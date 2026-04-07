export interface UploadedArtifact {
  url: string;
  pathname: string;
}

export interface ExportCacheEntry {
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
  cachedAt: string;
}

const CACHE_VERSION = "v1";

function getCachePath(videoId: string, order: "relevance" | "time") {
  return `cache/${CACHE_VERSION}/${videoId}.${order}.json`;
}

export async function uploadArtifact(
  filename: string,
  content: Buffer,
  contentType: string,
  options: { addRandomSuffix?: boolean; allowOverwrite?: boolean } = {},
) {
  const { put } = await import("@vercel/blob");
  const blob = await put(filename, content, {
    access: "public",
    addRandomSuffix: options.addRandomSuffix ?? true,
    allowOverwrite: options.allowOverwrite ?? false,
    contentType,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

export async function readExportCache(videoId: string, order: "relevance" | "time"): Promise<ExportCacheEntry | null> {
  const { head } = await import("@vercel/blob");
  const pathname = getCachePath(videoId, order);

  try {
    const blob = await head(pathname);
    const response = await fetch(blob.url, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ExportCacheEntry;
  } catch {
    return null;
  }
}

export async function writeExportCache(entry: ExportCacheEntry) {
  const pathname = getCachePath(entry.videoId, entry.order);
  return uploadArtifact(pathname, Buffer.from(JSON.stringify(entry, null, 2), "utf8"), "application/json; charset=utf-8", {
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}
