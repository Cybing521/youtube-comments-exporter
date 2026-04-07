import { NextResponse } from "next/server";
import { handleExportRequest } from "@/lib/handle-export-request";
import type { ExportProgressEvent, ExportStreamEvent } from "@/lib/export-types";

export const runtime = "nodejs";
export const maxDuration = 300;

function resolveErrorStatus(message: string) {
  if (
    message.startsWith("缺少") ||
    message.startsWith("请输入") ||
    message.startsWith("请先") ||
    message.startsWith("人机验证未通过") ||
    message.startsWith("人机验证主机名不匹配") ||
    message.startsWith("无法从链接中提取") ||
    message.startsWith("YouTube API Key 不可用")
  ) {
    return 400;
  }

  return 500;
}

function encodeEvent(event: ExportStreamEvent) {
  return `${JSON.stringify(event)}\n`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const pushEvent = (event: ExportStreamEvent) => {
          controller.enqueue(encoder.encode(encodeEvent(event)));
        };
        const handleProgress = (progress: ExportProgressEvent) => {
          pushEvent({
            type: "progress",
            progress,
          });
        };

        try {
          const result = await handleExportRequest(body, undefined, {
            expectedHostname: new URL(request.url).hostname,
            onProgress: handleProgress,
          });

          pushEvent({
            type: "success",
            result,
          });
        } catch (error) {
          pushEvent({
            type: "error",
            error: error instanceof Error ? error.message : "导出失败",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "导出失败";
    const status = resolveErrorStatus(message);
    return NextResponse.json({ error: message }, { status });
  }
}
