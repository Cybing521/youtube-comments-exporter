"use client";

import React from "react";
import type { ExportResponse } from "../lib/export-request";

interface ExportResultsProps {
  status: "idle" | "loading" | "success" | "error";
  error?: string;
  result?: ExportResponse | null;
}

export function ExportResults({ status, error, result }: ExportResultsProps) {
  if (status === "loading") {
    return (
      <section className="panel">
        <h2>导出结果</h2>
        <p>正在导出，请稍候…</p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="panel">
        <h2>导出结果</h2>
        <p>{error ?? "导出失败"}</p>
      </section>
    );
  }

  if (status === "success" && result) {
    return (
      <section className="panel">
        <h2>导出结果</h2>
        <p>导出完成</p>
        <ul className="download-list">
          <li>
            <a href={result.files.jsonUrl}>下载 JSON</a>
          </li>
          <li>
            <a href={result.files.threadedExcelUrl}>下载分层 Excel</a>
          </li>
          <li>
            <a href={result.files.flatExcelUrl}>下载扁平 Excel</a>
          </li>
        </ul>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>导出结果</h2>
      <p>导出完成后，这里会显示 JSON、分层 Excel 和扁平 Excel 的下载入口。</p>
    </section>
  );
}
