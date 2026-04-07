import { buildFlatWorkbook, buildThreadedWorkbook } from "./excel";
import type { ExportArtifacts, ExportResult, SortOrder } from "./types";

const JSON_MIME = "application/json; charset=utf-8";
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function buildStem(videoId: string, order: SortOrder): string {
  return `${videoId}.${order}.comments`;
}

export function buildJsonArtifact(exportResult: ExportResult & { order: SortOrder }) {
  const stem = buildStem(exportResult.videoId, exportResult.order);

  return {
    filename: `${stem}.json`,
    content: Buffer.from(JSON.stringify(exportResult, null, 2), "utf8"),
    contentType: JSON_MIME
  };
}

export function buildThreadedExcelArtifact(exportResult: ExportResult & { order: SortOrder }) {
  const stem = buildStem(exportResult.videoId, exportResult.order);

  return {
    filename: `${stem}.xlsx`,
    content: buildThreadedWorkbook(exportResult),
    contentType: XLSX_MIME
  };
}

export function buildFlatExcelArtifact(exportResult: ExportResult & { order: SortOrder }) {
  const stem = buildStem(exportResult.videoId, exportResult.order);

  return {
    filename: `${stem}.flat.xlsx`,
    content: buildFlatWorkbook(exportResult),
    contentType: XLSX_MIME
  };
}

export async function buildExportArtifacts(
  exportResult: ExportResult & { order: SortOrder }
): Promise<ExportArtifacts> {
  return {
    json: buildJsonArtifact(exportResult),
    threadedExcel: buildThreadedExcelArtifact(exportResult),
    flatExcel: buildFlatExcelArtifact(exportResult)
  };
}
