import { runExportAndUpload, type ExportJobInput, type ExportJobResult } from "./export-service";
import type { ExportProgressEvent, ExportRequestInput } from "./export-types";
import { verifyTurnstileToken } from "./turnstile";

interface ExportRouteDependencies {
  exportArtifacts: (input: ExportJobInput, options?: { onProgress?: (event: ExportProgressEvent) => void }) => Promise<ExportJobResult>;
  verifyTurnstile: (token: string) => Promise<{ success: boolean; hostname?: string }>;
}

interface ExportRouteOptions {
  expectedHostname?: string;
  onProgress?: (event: ExportProgressEvent) => void;
}

const defaultDependencies: ExportRouteDependencies = {
  exportArtifacts: (input, options) => runExportAndUpload(input, undefined, options),
  verifyTurnstile: verifyTurnstileToken,
};

function resolveApiKey(providedApiKey?: string) {
  const explicitKey = providedApiKey?.trim();
  if (explicitKey) {
    return explicitKey;
  }

  throw new Error("请输入 YouTube API Key");
}

function resolveTurnstileToken(providedToken?: string) {
  const explicitToken = providedToken?.trim();
  if (explicitToken) {
    return explicitToken;
  }

  throw new Error("请先完成人机验证");
}

export async function handleExportRequest(
  body: Partial<ExportRequestInput>,
  dependencies: ExportRouteDependencies = defaultDependencies,
  options: ExportRouteOptions = {},
) {
  if (!body.url?.trim()) {
    throw new Error("缺少 YouTube 链接");
  }

  options.onProgress?.({
    stage: "validating",
    title: "正在校验输入信息",
    detail: "正在确认链接、API key 和安全验证信息。",
  });

  const apiKey = resolveApiKey(body.apiKey);
  const turnstileToken = resolveTurnstileToken(body.turnstileToken);
  const turnstileResult = await dependencies.verifyTurnstile(turnstileToken);

  if (!turnstileResult.success) {
    throw new Error("人机验证未通过，请重试");
  }

  const verifiedHostname = turnstileResult.hostname?.trim().toLowerCase();
  const expectedHostname = options.expectedHostname?.trim().toLowerCase();

  if (expectedHostname && verifiedHostname !== expectedHostname) {
    throw new Error("人机验证主机名不匹配，请刷新后重试");
  }

  return dependencies.exportArtifacts(
    {
      url: body.url.trim(),
      apiKey,
      order: body.order ?? "time",
    },
    {
      onProgress: options.onProgress,
    },
  );
}
