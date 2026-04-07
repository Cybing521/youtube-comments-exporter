"use client";

import React from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { submitExportRequest } from "../lib/export-request";
import type { ExportResponse } from "../lib/export-types";

interface ExportFormProps {
  onStart: () => void;
  onSuccess: (result: ExportResponse) => void;
  onError: (message: string) => void;
}

function validateYouTubeUrl(url: string) {
  const value = url.trim();

  if (!value) {
    return "请输入 YouTube 视频链接";
  }

  if (!value.includes("youtube.com") && !value.includes("youtu.be")) {
    return "请输入有效的 YouTube 视频链接";
  }

  return null;
}

export function ExportForm({ onStart, onSuccess, onError }: ExportFormProps) {
  const [url, setUrl] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [turnstileToken, setTurnstileToken] = React.useState("");
  const [turnstileInstanceKey, setTurnstileInstanceKey] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??
    (process.env.NODE_ENV === "test" ? "1x00000000000000000000AA" : "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationMessage = validateYouTubeUrl(url);

    if (validationMessage) {
      onError(validationMessage);
      return;
    }

    onStart();
    setIsSubmitting(true);

    try {
      const result = await submitExportRequest({
        url,
        apiKey,
        turnstileToken,
        order: "time",
      });
      onSuccess(result);
    } catch (error) {
      setTurnstileToken("");
      setTurnstileInstanceKey((current) => current + 1);
      onError(error instanceof Error ? error.message : "导出失败");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel form-grid" onSubmit={handleSubmit} aria-busy={isSubmitting}>
      <div className="form-heading">
        <div>
          <p className="section-kicker">单视频导出</p>
          <h2>输入链接，在线生成下载文件</h2>
        </div>
        <p className="form-note">粘贴一个视频链接，我们会为你准备 JSON、分层 Excel 和扁平 Excel 三份文件。</p>
      </div>
      <div className="field">
        <label htmlFor="youtube-url">YouTube 链接</label>
        <input
          id="youtube-url"
          name="youtube-url"
          placeholder="粘贴 YouTube 视频链接"
          value={url}
          disabled={isSubmitting}
          onChange={(event) => setUrl(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="youtube-api-key">YouTube API Key</label>
        <input
          id="youtube-api-key"
          name="youtube-api-key"
          type="password"
          autoComplete="off"
          placeholder="粘贴你自己的 YouTube Data API key"
          value={apiKey}
          disabled={isSubmitting}
          onChange={(event) => setApiKey(event.target.value)}
        />
        <p className="helper-text">你的 API key 只用于本次导出请求，配额也会计入你自己的 Google Cloud 项目。</p>
      </div>
      <div className="field verification-field">
        <label htmlFor="turnstile-widget">安全验证</label>
        <div className="turnstile-shell" id="turnstile-widget">
          {turnstileSiteKey ? (
            <Turnstile
              key={turnstileInstanceKey}
              siteKey={turnstileSiteKey}
              onSuccess={(token) => {
                setTurnstileToken(token);
              }}
              onExpire={() => {
                setTurnstileToken("");
              }}
              onError={() => {
                setTurnstileToken("");
                onError("人机验证未通过，请重试");
              }}
            />
          ) : (
            <p className="helper-text">当前站点还没有配置 Turnstile site key，暂时无法提交导出。</p>
          )}
        </div>
      </div>
      <div className="action-row">
        <p className="hint-text">建议使用完整的视频页面链接。评论较多的视频通常需要几十秒，请耐心等待。</p>
        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting || !url.trim() || !apiKey.trim() || !turnstileToken.trim()}
        >
          {isSubmitting ? "正在导出..." : "开始导出"}
        </button>
      </div>
    </form>
  );
}
