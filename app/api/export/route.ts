import { NextResponse } from "next/server";
import { handleExportRequest } from "@/lib/handle-export-request";

export const runtime = "nodejs";
export const maxDuration = 300;

function resolveErrorStatus(message: string) {
  if (
    message.startsWith("缺少") ||
    message.startsWith("请输入") ||
    message.startsWith("无法从链接中提取")
  ) {
    return 400;
  }

  return 500;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleExportRequest(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "导出失败";
    const status = resolveErrorStatus(message);
    return NextResponse.json({ error: message }, { status });
  }
}
