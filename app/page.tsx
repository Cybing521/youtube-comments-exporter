"use client";

import React from "react";
import { ExportForm } from "@/components/export-form";
import { ExportResults } from "@/components/export-results";
import type { ExportResponse } from "@/lib/export-types";

export default function HomePage() {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = React.useState<string>("");
  const [result, setResult] = React.useState<ExportResponse | null>(null);

  return (
    <main className="page-shell">
      <section className="hero panel">
        <p className="eyebrow">在线导出工具</p>
        <h1>YouTube 评论导出</h1>
        <p className="lead">
          把视频链接交给这个页面，在线生成 JSON、分层 Excel 和扁平 Excel，方便直接下载和分享。
        </p>
        <div className="hero-badges" aria-label="功能亮点">
          <span>单视频导出</span>
          <span>中文界面</span>
          <span>三种文件下载</span>
        </div>
      </section>
      <ExportForm
        onStart={() => {
          setStatus("loading");
          setError("");
          setResult(null);
        }}
        onSuccess={(nextResult) => {
          setStatus("success");
          setResult(nextResult);
        }}
        onError={(message) => {
          setStatus("error");
          setError(message);
        }}
      />
      <ExportResults status={status} error={error} result={result} />
    </main>
  );
}
