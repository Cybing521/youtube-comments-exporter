"use client";

import React from "react";
import { submitExportRequest, type ExportResponse } from "../lib/export-request";

interface ExportFormProps {
  onStart: () => void;
  onSuccess: (result: ExportResponse) => void;
  onError: (message: string) => void;
}

export function ExportForm({ onStart, onSuccess, onError }: ExportFormProps) {
  const [url, setUrl] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStart();

    try {
      const result = await submitExportRequest({
        url,
        apiKey,
        order: "time",
      });
      onSuccess(result);
    } catch (error) {
      onError(error instanceof Error ? error.message : "导出失败");
    }
  }

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="youtube-url">YouTube 链接</label>
        <input
          id="youtube-url"
          name="youtube-url"
          placeholder="粘贴 YouTube 视频链接"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="api-key">API 密钥</label>
        <input
          id="api-key"
          name="api-key"
          placeholder="粘贴 YouTube Data API 密钥"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
        />
      </div>
      <button type="submit" className="primary-button">
        开始导出
      </button>
    </form>
  );
}
