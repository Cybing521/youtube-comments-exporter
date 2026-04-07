import { runExportAndUpload, type ExportJobInput, type ExportJobResult } from "./export-service";
import type { ExportRequestInput } from "./export-types";

interface ExportRouteDependencies {
  exportArtifacts: (input: ExportJobInput) => Promise<ExportJobResult>;
}

const defaultDependencies: ExportRouteDependencies = {
  exportArtifacts: runExportAndUpload,
};

function resolveApiKey(providedApiKey?: string) {
  const explicitKey = providedApiKey?.trim();
  if (explicitKey) {
    return explicitKey;
  }

  const envKey = process.env.YOUTUBE_API_KEY?.trim();
  if (envKey) {
    return envKey;
  }

  throw new Error("服务端未配置 YOUTUBE_API_KEY");
}

export async function handleExportRequest(
  body: Partial<ExportRequestInput> & { apiKey?: string },
  dependencies: ExportRouteDependencies = defaultDependencies,
) {
  if (!body.url?.trim()) {
    throw new Error("缺少 YouTube 链接");
  }

  return dependencies.exportArtifacts({
    url: body.url.trim(),
    apiKey: resolveApiKey(body.apiKey),
    order: body.order ?? "time",
  });
}
