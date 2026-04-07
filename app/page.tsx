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
        <div className="hero-topline">
          <p className="eyebrow">在线导出工具</p>
          <a className="hero-feedback-link" href="mailto:cyibin06@gmail.com?subject=YouTube%20评论导出反馈">
            邮箱反馈
          </a>
        </div>
        <div className="hero-content">
          <div className="hero-main">
            <h1>YouTube 评论导出</h1>
            <p className="lead">贴一个公开视频链接，填入自己的 API key，就能在线拿到 JSON、分层 Excel 和扁平 Excel。</p>
            <div className="hero-badges" aria-label="功能亮点">
              <span>单视频导出</span>
              <span>更适合研究 / 运营 / 内容分析</span>
              <span>结果页适合直接截图分享</span>
            </div>
          </div>
          <aside className="hero-sidecard" aria-label="快速价值说明">
            <strong>第一次来也能直接用</strong>
            <p>三步完成：填链接、贴 API key、做人机验证。导出完成后就能直接下载，或者截图发给别人。</p>
            <a href="mailto:cyibin06@gmail.com?subject=YouTube%20评论导出反馈">给我发需求或反馈</a>
          </aside>
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
