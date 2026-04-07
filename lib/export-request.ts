import type { ExportProgressEvent, ExportRequestInput, ExportResponse, ExportStreamEvent } from "./export-types";

interface SubmitExportRequestOptions {
  onProgress?: (event: ExportProgressEvent) => void;
}

async function parseStreamResponse(
  response: Response,
  options: SubmitExportRequestOptions,
): Promise<ExportResponse> {
  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("导出响应不可读取，请稍后再试");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: ExportResponse | null = null;

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        continue;
      }

      const event = JSON.parse(trimmed) as ExportStreamEvent;

      if (event.type === "progress") {
        options.onProgress?.(event.progress);
        continue;
      }

      if (event.type === "error") {
        throw new Error(event.error);
      }

      finalResult = event.result;
    }
  }

  const trailingLine = buffer.trim();
  if (trailingLine) {
    const event = JSON.parse(trailingLine) as ExportStreamEvent;
    if (event.type === "progress") {
      options.onProgress?.(event.progress);
    } else if (event.type === "error") {
      throw new Error(event.error);
    } else {
      finalResult = event.result;
    }
  }

  if (!finalResult) {
    throw new Error("导出完成了，但没有收到最终结果");
  }

  return finalResult;
}

export async function submitExportRequest(
  input: ExportRequestInput,
  options: SubmitExportRequestOptions = {},
): Promise<ExportResponse> {
  if (!input.url.trim()) {
    throw new Error("缺少 YouTube 链接");
  }
  if (!input.apiKey.trim()) {
    throw new Error("请输入 YouTube API Key");
  }
  if (!input.turnstileToken.trim()) {
    throw new Error("请先完成人机验证");
  }

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

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json() as Promise<ExportResponse>;
  }

  return parseStreamResponse(response, options);
}
