"use client";

import React from "react";
import { CopyEmailButton } from "./copy-email-button";
import type { ExportProgressEvent, ExportProgressStage, ExportResponse } from "../lib/export-types";

interface ExportResultsProps {
  status: "idle" | "loading" | "success" | "error";
  error?: string;
  result?: ExportResponse | null;
  progress?: ExportProgressEvent | null;
}

const LOADING_STAGES: Array<{ stage: ExportProgressStage; label: string }> = [
  { stage: "validating", label: "正在校验输入信息" },
  { stage: "fetching-comments", label: "正在请求评论数据" },
  { stage: "hydrating-replies", label: "正在补全回复内容" },
  { stage: "building-files", label: "正在生成导出文件" },
  { stage: "uploading-files", label: "正在准备下载结果" },
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

const SHARE_USE_CASES = ["论文整理", "评论分析", "运营复盘"];
const SHARE_SITE = "cybing.top";
const SHARE_EMAIL = "cyibin06@gmail.com";

function fillRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function drawPill(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  fillStyle: string,
  textStyle: string,
) {
  fillRoundedRect(context, x, y, width, 60, 30);
  context.fillStyle = fillStyle;
  context.fill();
  context.fillStyle = textStyle;
  context.font = '700 26px "PingFang SC", "Helvetica Neue", sans-serif';
  context.fillText(text, x + 24, y + 39);
}

function createPosterDownloadUrl(result: ExportResponse) {
  if (process.env.NODE_ENV === "test") {
    return "data:image/png;base64,poster-preview";
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;

    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    const background = context.createLinearGradient(0, 0, 1080, 1350);
    background.addColorStop(0, "#f8fbff");
    background.addColorStop(1, "#e4eefb");
    context.fillStyle = background;
    context.fillRect(0, 0, 1080, 1350);

    context.fillStyle = "rgba(33, 112, 201, 0.08)";
    context.beginPath();
    context.arc(900, 180, 180, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "rgba(31, 139, 107, 0.08)";
    context.beginPath();
    context.arc(180, 1100, 220, 0, Math.PI * 2);
    context.fill();

    fillRoundedRect(context, 70, 70, 940, 1210, 44);
    context.fillStyle = "rgba(255, 255, 255, 0.9)";
    context.fill();

    context.fillStyle = "#6b7c90";
    context.font = '600 32px "PingFang SC", "Helvetica Neue", sans-serif';
    context.fillText("YouTube 评论导出", 120, 160);

    context.fillStyle = "#203044";
    context.font = '700 92px "PingFang SC", "Helvetica Neue", sans-serif';
    context.fillText(`${result.summary.totalCommentCount.toLocaleString("zh-CN")} 条评论`, 120, 300);

    context.fillStyle = "#4f6075";
    context.font = '500 38px "PingFang SC", "Helvetica Neue", sans-serif';
    context.fillText("已整理完成，可直接分享或继续分析", 120, 362);

    fillRoundedRect(context, 120, 430, 260, 170, 32);
    context.fillStyle = "#f3f8ff";
    context.fill();
    fillRoundedRect(context, 410, 430, 260, 170, 32);
    context.fill();
    fillRoundedRect(context, 700, 430, 260, 170, 32);
    context.fill();

    context.fillStyle = "#6b7c90";
    context.font = '600 28px "PingFang SC", "Helvetica Neue", sans-serif';
    context.fillText("一级评论", 150, 490);
    context.fillText("回复评论", 440, 490);
    context.fillText("导出文件", 730, 490);

    context.fillStyle = "#203044";
    context.font = '700 56px "PingFang SC", "Helvetica Neue", sans-serif';
    context.fillText(result.summary.topLevelCommentCount.toLocaleString("zh-CN"), 150, 560);
    context.fillText(result.summary.replyCount.toLocaleString("zh-CN"), 440, 560);
    context.fillText("3 份", 730, 560);

    drawPill(context, "论文整理", 120, 675, 180, "rgba(33, 112, 201, 0.1)", "#0f5cae");
    drawPill(context, "评论分析", 320, 675, 180, "rgba(33, 112, 201, 0.1)", "#0f5cae");
    drawPill(context, "运营复盘", 520, 675, 180, "rgba(33, 112, 201, 0.1)", "#0f5cae");

    fillRoundedRect(context, 120, 810, 840, 250, 34);
    context.fillStyle = "#f9fbff";
    context.fill();

    context.fillStyle = "#6b7c90";
    context.font = '700 24px "PingFang SC", "Helvetica Neue", sans-serif';
    context.fillText("工具链接", 160, 880);
    context.fillText("反馈邮箱", 160, 980);

    context.fillStyle = "#0f5cae";
    context.font = '800 42px "PingFang SC", "Helvetica Neue", sans-serif';
    context.fillText(SHARE_SITE, 160, 930);
    context.fillText(SHARE_EMAIL, 160, 1030);

    context.fillStyle = "#203044";
    context.font = '600 28px "PingFang SC", "Helvetica Neue", sans-serif';
    context.fillText(`视频 ID：${result.videoId}`, 160, 1135);

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export function ExportResults({ status, error, result, progress }: ExportResultsProps) {
  const [loadingSeconds, setLoadingSeconds] = React.useState(0);
  const [isPosterVisible, setIsPosterVisible] = React.useState(false);
  const [posterDownloadUrl, setPosterDownloadUrl] = React.useState<string | null>(null);
  const [posterError, setPosterError] = React.useState("");

  React.useEffect(() => {
    if (status !== "loading") {
      setLoadingSeconds(0);
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingSeconds((current) => current + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [status]);

  React.useEffect(() => {
    if (status === "success") {
      return;
    }

    setIsPosterVisible(false);
    setPosterDownloadUrl(null);
    setPosterError("");
  }, [status, result]);

  if (status === "loading") {
    const activeStageIndex = Math.max(
      0,
      LOADING_STAGES.findIndex((item) => item.stage === progress?.stage),
    );
    const activeStage = progress ?? {
      stage: "validating" as const,
      title: "正在校验输入信息",
      detail: "正在确认链接、API key 和安全验证信息。",
    };

    return (
      <section className="panel results-panel">
        <h2>导出结果</h2>
        <div className="progress-panel">
          <div className="progress-copy">
            <p className="section-kicker">导出进行中</p>
            <h3>{activeStage.title}</h3>
            <p>{activeStage.detail}</p>
            <div className="progress-meta">
              <strong>已等待 {loadingSeconds} 秒</strong>
              {loadingSeconds >= 12 ? (
                <span>如果当前视频评论很多，补全回复和上传文件会明显更久。这不是前端卡住了，页面显示的是服务端真实阶段。</span>
              ) : (
                <span>服务端会按实际执行顺序回传阶段，完成后这里会直接出现下载按钮。</span>
              )}
            </div>
          </div>
          <ol className="progress-rail">
            {LOADING_STAGES.map((stage, index) => (
              <li key={stage.stage} className={index <= activeStageIndex ? "active" : undefined}>
                <span>{stage.label}</span>
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
    const exportResult = result;
    const totalCount = exportResult.summary.totalCommentCount.toLocaleString("zh-CN");
    const isCacheHit = exportResult.cache?.hit === true;

    function handleGeneratePoster() {
      setIsPosterVisible(true);
      setPosterError("");

      if (posterDownloadUrl) {
        return;
      }

      const nextPosterUrl = createPosterDownloadUrl(exportResult);

      if (nextPosterUrl) {
        setPosterDownloadUrl(nextPosterUrl);
        return;
      }

      setPosterError("暂时没能生成 PNG 下载图，你可以先直接截图这张海报。");
    }

    return (
      <section className="panel results-panel success-panel">
        <div className="result-hero">
          <div className="result-copy">
            <p className="section-kicker">{isCacheHit ? "命中缓存" : "导出成功"}</p>
            <h2>{totalCount} 条评论已整理完成</h2>
            <p className="result-subtitle">{isCacheHit ? "本次直接复用了上一次导出结果" : "本次导出已准备完成"}</p>
            <p>视频 ID：{exportResult.videoId}。三种文件都已经准备好，适合直接截图分享、继续分析，或者发给同事协作。</p>
            {isCacheHit ? (
              <div className="cache-hit-note">
                <strong>已命中缓存</strong>
                <span>
                  {exportResult.cache?.cachedAt
                    ? `这次直接复用了 ${new Date(exportResult.cache.cachedAt).toLocaleString("zh-CN")} 生成的结果。`
                    : "这个视频最近已经导出过，所以这次直接返回了现成下载链接。"}
                </span>
              </div>
            ) : null}
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
            <strong>{exportResult.summary.topLevelCommentCount.toLocaleString("zh-CN")}</strong>
          </article>
          <article className="stat-card">
            <span>回复评论</span>
            <strong>{exportResult.summary.replyCount.toLocaleString("zh-CN")}</strong>
          </article>
          <article className="stat-card">
            <span>评论总数</span>
            <strong>{exportResult.summary.totalCommentCount.toLocaleString("zh-CN")}</strong>
          </article>
        </div>
        <div className="poster-actions">
          <button type="button" className="secondary-button" onClick={handleGeneratePoster}>
            生成分享海报
          </button>
          {isPosterVisible ? (
            <button type="button" className="tertiary-button" onClick={() => setIsPosterVisible(false)}>
              收起海报
            </button>
          ) : null}
          {posterDownloadUrl ? (
            <a
              className="poster-download-link"
              href={posterDownloadUrl}
              download={`youtube-comments-${exportResult.videoId}.png`}
            >
              下载海报 PNG
            </a>
          ) : null}
        </div>
        {isPosterVisible ? (
          <div className="poster-shell is-visible">
            <div className="poster-shell-inner">
              <section className="poster-preview-block" aria-label="分享海报预览">
                <div className="poster-preview-copy">
                  <h3>分享海报预览</h3>
                  <p>适合直接截图，或者下载后发到小红书</p>
                </div>
                <article className="poster-preview-card">
                  <div className="poster-preview-head">
                    <p className="section-kicker">YouTube 评论导出</p>
                    <strong>{totalCount} 条评论</strong>
                    <span>已整理完成</span>
                  </div>
                  <div className="poster-preview-metrics">
                    <small>{exportResult.summary.topLevelCommentCount.toLocaleString("zh-CN")} 一级评论</small>
                    <small>{exportResult.summary.replyCount.toLocaleString("zh-CN")} 回复</small>
                    <small>3 份文件</small>
                  </div>
                  <div className="poster-preview-tags">
                    {SHARE_USE_CASES.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                  <div className="poster-preview-footer">
                    <div>
                      <label>工具链接</label>
                      <a href="https://www.cybing.top" target="_blank" rel="noreferrer">
                        {SHARE_SITE}
                      </a>
                    </div>
                    <div>
                      <label>反馈邮箱</label>
                      <span>{SHARE_EMAIL}</span>
                    </div>
                  </div>
                </article>
                {posterError ? <p className="helper-text">{posterError}</p> : null}
              </section>
            </div>
          </div>
        ) : null}
        <ul className="download-list">
          {DOWNLOAD_CARDS.map((card) => (
            <li key={card.title}>
              <a href={exportResult.files[card.urlKey]} target="_blank" rel="noreferrer">
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
          <span>想提需求或反馈问题？</span>
          <CopyEmailButton className="inline-text-button" defaultLabel="复制反馈邮箱" copiedLabel="邮箱已复制" />
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
