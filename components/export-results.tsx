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

const DOWNLOAD_CARDS = [
  {
    tag: "原始数据",
    title: "下载 JSON",
    description: "保留完整结构，适合继续接脚本或做内容分析。",
    urlKey: "jsonUrl" as const,
  },
  {
    tag: "阅读整理",
    title: "下载分层 Excel",
    description: "更适合人工核对一级评论和高赞回复关系。",
    urlKey: "threadedExcelUrl" as const,
  },
  {
    tag: "分析表格",
    title: "下载扁平 Excel",
    description: "直接拿去筛选、透视或批量整理更顺手。",
    urlKey: "flatExcelUrl" as const,
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
    const totalCount = result.summary.totalCommentCount.toLocaleString("zh-CN");

    return (
      <section className="panel results-panel success-panel">
        <div className="result-hero">
          <div className="result-copy">
            <p className="section-kicker">导出成功</p>
            <h2>{totalCount} 条评论已整理完成</h2>
            <p className="result-subtitle">本次导出已准备完成</p>
            <p>视频 ID：{result.videoId}。三种文件都已经准备好，适合直接截图分享、继续分析，或者发给同事协作。</p>
            <div className="result-link-callout">
              <span>工具链接</span>
              <a href="https://www.cybing.top" target="_blank" rel="noreferrer">
                cybing.top
              </a>
            </div>
          </div>
          <div className="result-ready">
            <span>3 份文件已就绪</span>
            <small>JSON / 分层 Excel / 扁平 Excel</small>
          </div>
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
        <section className="share-card" aria-label="分享卡片">
          <div className="share-card-copy">
            <p className="section-kicker">截图分享区</p>
            <h3>{totalCount} 条评论</h3>
            <p>这次导出的结构化结果已经准备好，适合直接截图发给同事、朋友或发到小红书展示。</p>
          </div>
          <div className="share-card-metrics">
            <span>{result.summary.topLevelCommentCount.toLocaleString("zh-CN")} 一级评论</span>
            <span>{result.summary.replyCount.toLocaleString("zh-CN")} 回复</span>
            <span>3 份文件</span>
          </div>
          <div className="share-card-footer">
            <div className="share-card-link">
              <small>工具链接</small>
              <a href="https://www.cybing.top" target="_blank" rel="noreferrer">
                www.cybing.top
              </a>
            </div>
            <div className="share-card-link">
              <small>邮箱反馈</small>
              <a href="mailto:cyibin06@gmail.com?subject=YouTube%20评论导出反馈">cyibin06@gmail.com</a>
            </div>
          </div>
        </section>
        <ul className="download-list">
          {DOWNLOAD_CARDS.map((card) => (
            <li key={card.title}>
              <a href={result.files[card.urlKey]} target="_blank" rel="noreferrer">
                <small className="download-tag">{card.tag}</small>
                <span>{card.title}</span>
                <small>{card.description}</small>
              </a>
            </li>
          ))}
        </ul>
        <div className="next-actions">
          <span>下一步你可以</span>
          <div className="next-action-list">
            <small>做评论筛选和数据透视</small>
            <small>整理研究材料或运营复盘</small>
            <small>分享这次导出结果截图</small>
          </div>
        </div>
        <p className="results-feedback">
          想提需求或反馈问题？
          <a href="mailto:cyibin06@gmail.com?subject=YouTube%20评论导出反馈">发邮件到 cyibin06@gmail.com</a>
        </p>
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
