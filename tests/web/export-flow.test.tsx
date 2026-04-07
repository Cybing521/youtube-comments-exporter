/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "../../app/page";

const writeText = vi.fn(async () => undefined);

vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({ onSuccess }: { onSuccess?: (token: string) => void }) => (
    <button type="button" onClick={() => onSuccess?.("turnstile-token")}>
      完成人机验证
    </button>
  )
}));

describe("export flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    writeText.mockClear();
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows staged progress while an export is running", async () => {
    vi.useFakeTimers();
    const encoder = new TextEncoder();
    let streamController: ReadableStreamDefaultController<Uint8Array> | undefined;

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              streamController = controller;
            },
          }),
          {
            status: 200,
            headers: { "content-type": "text/plain; charset=utf-8" },
          },
        ),
      ),
    );

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "填入示例链接" }));
    fireEvent.change(screen.getByLabelText("YouTube API Key"), {
      target: { value: "AIza-user" },
    });
    fireEvent.click(screen.getByRole("button", { name: "完成人机验证" }));
    fireEvent.click(screen.getByRole("button", { name: "开始导出" }));

    expect(screen.getByRole("heading", { name: "正在校验输入信息" })).toBeInTheDocument();
    expect(screen.getByText("已等待 0 秒")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByText("已等待 1 秒")).toBeInTheDocument();

    await act(async () => {
      streamController?.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: "progress",
            progress: {
              stage: "fetching-comments",
              title: "正在请求评论数据",
              detail: "已获取第 1 页评论线程，继续向后补齐。",
            },
          })}\n`,
        ),
      );
      await Promise.resolve();
    });
    expect(screen.getByRole("heading", { name: "正在请求评论数据" })).toBeInTheDocument();

    await act(async () => {
      streamController?.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: "progress",
            progress: {
              stage: "hydrating-replies",
              title: "正在补全回复内容",
              detail: "正在补全当前批次回复：48/100。",
            },
          })}\n`,
        ),
      );
      vi.advanceTimersByTime(11000);
      await Promise.resolve();
    });
    expect(screen.getByRole("heading", { name: "正在补全回复内容" })).toBeInTheDocument();
    expect(
      screen.getByText("如果当前视频评论很多，补全回复和上传文件会明显更久。这不是前端卡住了，页面显示的是服务端真实阶段。"),
    ).toBeInTheDocument();

    await act(async () => {
      streamController?.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: "progress",
            progress: {
              stage: "building-files",
              title: "正在生成导出文件",
              detail: "开始整理 JSON、分层 Excel 和扁平 Excel。",
            },
          })}\n`,
        ),
      );
      await Promise.resolve();
    });
    expect(screen.getByRole("heading", { name: "正在生成导出文件" })).toBeInTheDocument();

    await act(async () => {
      streamController?.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: "progress",
            progress: {
              stage: "uploading-files",
              title: "正在准备下载结果",
              detail: "三个文件都已上传完成，正在整理最终下载入口。",
            },
          })}\n`,
        ),
      );
      await Promise.resolve();
    });
    expect(screen.getByRole("heading", { name: "正在准备下载结果" })).toBeInTheDocument();

    await act(async () => {
      streamController?.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: "success",
            result: {
              videoId: "gtEROmL0NzQ",
              order: "time",
              summary: {
                topLevelCommentCount: 1504,
                replyCount: 1122,
                totalCommentCount: 2626,
              },
              files: {
                jsonUrl: "https://blob.example/json",
                threadedExcelUrl: "https://blob.example/threaded",
                flatExcelUrl: "https://blob.example/flat",
              },
            },
          })}\n`,
        ),
      );
      streamController?.close();
      await Promise.resolve();
    });

    expect(screen.getByText("本次导出已准备完成")).toBeInTheDocument();
  });

  it("submits export and shows download links", async () => {
    const encoder = new TextEncoder();

    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        const body =
          `${JSON.stringify({
            type: "progress",
            progress: {
              stage: "fetching-comments",
              title: "正在请求评论数据",
              detail: "已获取第 1 页评论线程，继续向后补齐。",
            },
          })}\n` +
          `${JSON.stringify({
            type: "success",
            result: {
              videoId: "gtEROmL0NzQ",
              order: "time",
              summary: {
                topLevelCommentCount: 1504,
                replyCount: 1122,
                totalCommentCount: 2626,
              },
              files: {
                jsonUrl: "https://blob.example/json",
                threadedExcelUrl: "https://blob.example/threaded",
                flatExcelUrl: "https://blob.example/flat",
              },
            },
          })}\n`;

        return new Response(
          new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode(body));
              controller.close();
            },
          }),
          {
            status: 200,
            headers: { "content-type": "text/plain; charset=utf-8" },
          },
        );
      }),
    );

    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "填入示例链接" }));
    fireEvent.change(screen.getByLabelText("YouTube API Key"), {
      target: { value: "AIza-user" }
    });
    fireEvent.click(screen.getByRole("button", { name: "完成人机验证" }));
    fireEvent.click(screen.getByRole("button", { name: "开始导出" }));

    await waitFor(() => {
      expect(screen.getByText("本次导出已准备完成")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/export",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
          apiKey: "AIza-user",
          turnstileToken: "turnstile-token",
          order: "time"
        })
      })
    );

    expect(screen.getByText("2,626 条评论已整理完成")).toBeInTheDocument();
    expect(screen.getAllByText("工具链接").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("cybing.top")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "复制反馈邮箱" })).toBeInTheDocument();
    expect(screen.getByText("原始数据")).toBeInTheDocument();
    expect(screen.getByText("阅读整理")).toBeInTheDocument();
    expect(screen.getByText("分析表格")).toBeInTheDocument();
    expect(screen.getByText("下一步你可以")).toBeInTheDocument();
    expect(screen.getByText("做评论筛选和数据透视")).toBeInTheDocument();
    expect(screen.getByText("整理研究材料或运营复盘")).toBeInTheDocument();
    expect(screen.getByText("分享这次导出结果截图")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "生成分享海报" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "生成分享海报" }));

    expect(screen.getByText("分享海报预览")).toBeInTheDocument();
    expect(screen.getByText("适合直接截图，或者下载后发到小红书")).toBeInTheDocument();
    expect(screen.getByText("论文整理")).toBeInTheDocument();
    expect(screen.getByText("评论分析")).toBeInTheDocument();
    expect(screen.getByText("运营复盘")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "下载海报 PNG" })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "复制反馈邮箱" }));
    });
    expect(writeText).toHaveBeenCalledWith("cyibin06@gmail.com");

    expect(screen.getByRole("link", { name: /下载 JSON/ })).toHaveAttribute(
      "href",
      "https://blob.example/json",
    );
    expect(screen.getByRole("link", { name: /下载分层 Excel/ })).toHaveAttribute(
      "href",
      "https://blob.example/threaded",
    );
    expect(screen.getByRole("link", { name: /下载扁平 Excel/ })).toHaveAttribute(
      "href",
      "https://blob.example/flat",
    );
  });
});
