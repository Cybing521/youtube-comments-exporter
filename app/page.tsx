"use client";

import React from "react";
import { CopyEmailButton } from "@/components/copy-email-button";
import { ExportForm } from "@/components/export-form";
import { ExportResults } from "@/components/export-results";
import type { ExportProgressEvent, ExportResponse } from "@/lib/export-types";

export default function HomePage() {
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = React.useState<string>("");
  const [result, setResult] = React.useState<ExportResponse | null>(null);
  const [progress, setProgress] = React.useState<ExportProgressEvent | null>(null);

  return (
    <main className="page-shell">
      <section className="hero panel">
        <div className="hero-topline">
          <CopyEmailButton className="hero-feedback-link" defaultLabel="邮箱反馈" />
        </div>
        <div className="hero-content">
          <div className="hero-main">
            <h1>YouTube 评论导出</h1>
            <p className="lead">贴链接，填 API key，等导出完成后直接下载 JSON 和 Excel。</p>
            <div className="hero-badges" aria-label="功能亮点">
              <span>单视频导出</span>
              <span>研究 / 运营 / 内容分析</span>
              <span>结果页适合直接截图分享</span>
            </div>
          </div>
          <aside className="hero-sidecard" aria-label="快速步骤">
            <strong>贴链接 → 填 API key → 开始导出</strong>
            <p>导出完成后会直接出现 JSON、分层 Excel 和扁平 Excel 下载入口。</p>
          </aside>
        </div>
      </section>
      <ExportForm
        onStart={() => {
          setStatus("loading");
          setError("");
          setResult(null);
          setProgress(null);
        }}
        onProgress={(nextProgress) => setProgress(nextProgress)}
        onSuccess={(nextResult) => {
          setStatus("success");
          setResult(nextResult);
          setProgress(null);
        }}
        onError={(message) => {
          setStatus("error");
          setError(message);
          setProgress(null);
        }}
      />
      <ExportResults status={status} error={error} result={result} progress={progress} />
    </main>
  );
}
