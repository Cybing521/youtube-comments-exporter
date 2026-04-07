"use client";

import React from "react";
import type { ExportResponse } from "../lib/export-types";

interface ExportResultsProps {
  status: "idle" | "loading" | "success" | "error";
  error?: string;
  result?: ExportResponse | null;
}

export function ExportResults({ status, error, result }: ExportResultsProps) {
  if (status === "loading") {
    return (
      <section className="panel results-panel">
        <h2>导出结果</h2>
        <p>正在导出评论，请稍候。页面会在文件准备完成后显示下载入口。</p>
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
        <h2>导出结果</h2>
        <p>导出完成，下面是本次任务的概要和文件下载入口。</p>
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
              <small>保留最完整的结构化原始数据，适合继续处理或接入脚本。</small>
            </a>
          </li>
          <li>
            <a href={result.files.threadedExcelUrl} target="_blank" rel="noreferrer">
              <span>下载分层 Excel</span>
              <small>按一级评论和回复分开展示，适合人工阅读和内容核对。</small>
            </a>
          </li>
          <li>
            <a href={result.files.flatExcelUrl} target="_blank" rel="noreferrer">
              <span>下载扁平 Excel</span>
              <small>所有评论统一成单表，适合筛选、统计、透视表和分析。</small>
            </a>
          </li>
        </ul>
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
