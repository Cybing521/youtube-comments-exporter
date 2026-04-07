"use client";

import React from "react";
import type { ExportResponse } from "../lib/export-types";

interface ExportResultsProps {
  status: "idle" | "loading" | "success" | "error";
  error?: string;
  result?: ExportResponse | null;
}

const LOADING_STAGES = [
  {
    title: "正在校验输入信息",
    detail: "确认链接、API key 和安全验证已经准备好。",
  },
  {
    title: "正在请求评论数据",
    detail: "开始获取一级评论并补全回复内容。",
  },
  {
    title: "正在生成导出文件",
    detail: "整理 JSON、分层 Excel 和扁平 Excel。",
  },
  {
    title: "正在准备下载结果",
    detail: "上传文件并整理最终下载入口。",
  },
];

export function ExportResults({ status, error, result }: ExportResultsProps) {
  const [loadingStageIndex, setLoadingStageIndex] = React.useState(0);

  React.useEffect(() => {
    if (status !== "loading") {
      setLoadingStageIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingStageIndex((current) => Math.min(current + 1, LOADING_STAGES.length - 1));
    }, 850);

    return () => {
      window.clearInterval(timer);
    };
  }, [status]);

  if (status === "loading") {
    const activeStage = LOADING_STAGES[loadingStageIndex];

    return (
      <section className="panel results-panel">
        <h2>导出结果</h2>
        <div className="progress-panel">
          <div className="progress-copy">
            <p className="section-kicker">导出进行中</p>
            <h3>{activeStage.title}</h3>
            <p>{activeStage.detail}</p>
          </div>
          <ol className="progress-rail">
            {LOADING_STAGES.map((stage, index) => (
              <li key={stage.title} className={index <= loadingStageIndex ? "active" : undefined}>
                <span>{stage.title}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="pulse-row" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="panel results-panel">
        <h2>导出结果</h2>
        <p className="error-text">{error ?? "导出失败"}</p>
        <p className="helper-text">请确认链接可正常打开、视频开启了评论区；如果是暂时失败，可以稍后再试一次。</p>
      </section>
    );
  }

  if (status === "success" && result) {
    return (
      <section className="panel results-panel success-panel">
        <div className="result-hero">
          <div className="result-copy">
            <p className="section-kicker">导出成功</p>
            <h2>本次导出已准备完成</h2>
            <p>视频 ID：{result.videoId}。三种文件都已经准备好，适合直接截图分享或继续分析。</p>
          </div>
          <div className="result-ready">3 份文件已就绪</div>
        </div>
        <div className="stats-grid">
          <article className="stat-card">
            <span>一级评论</span>
            <strong>{result.summary.topLevelCommentCount.toLocaleString("zh-CN")}</strong>
          </article>
          <article className="stat-card">
            <span>回复评论</span>
            <strong>{result.summary.replyCount.toLocaleString("zh-CN")}</strong>
          </article>
          <article className="stat-card">
            <span>评论总数</span>
            <strong>{result.summary.totalCommentCount.toLocaleString("zh-CN")}</strong>
          </article>
        </div>
        <ul className="download-list">
          <li>
            <a href={result.files.jsonUrl} target="_blank" rel="noreferrer">
              <span>下载 JSON</span>
              <small>适合继续做内容分析或接入脚本。</small>
            </a>
          </li>
          <li>
            <a href={result.files.threadedExcelUrl} target="_blank" rel="noreferrer">
              <span>下载分层 Excel</span>
              <small>适合人工核对评论结构和高赞回复。</small>
            </a>
          </li>
          <li>
            <a href={result.files.flatExcelUrl} target="_blank" rel="noreferrer">
              <span>下载扁平 Excel</span>
              <small>适合直接做筛选、透视表和批量整理。</small>
            </a>
          </li>
        </ul>
        <div className="next-actions">
          <span>下一步你可以</span>
          <div className="next-action-list">
            <small>做评论筛选和数据透视</small>
            <small>整理研究材料或运营复盘</small>
            <small>分享这次导出结果截图</small>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel results-panel">
      <h2>导出结果</h2>
      <p>导出完成后，这里会显示评论统计信息，以及 JSON、分层 Excel 和扁平 Excel 的下载入口。</p>
    </section>
  );
}
