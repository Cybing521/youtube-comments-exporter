import type { ExportRequestInput, ExportResponse } from "./export-types";

export async function submitExportRequest(input: ExportRequestInput): Promise<ExportResponse> {
  if (!input.url.trim()) {
    throw new Error("缺少 YouTube 链接");
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

  return response.json() as Promise<ExportResponse>;
}
