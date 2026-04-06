import { NextResponse } from "next/server";
import { handleExportRequest } from "@/lib/export-request";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleExportRequest(body);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "导出失败";
    const status = message.startsWith("缺少") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
