/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "../../app/page";

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
  });

  it("submits export and shows download links", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
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
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        ),
      ),
    );

    render(<HomePage />);

    fireEvent.change(screen.getByLabelText("YouTube 链接"), {
      target: { value: "https://www.youtube.com/watch?v=gtEROmL0NzQ" },
    });
    fireEvent.change(screen.getByLabelText("YouTube API Key"), {
      target: { value: "AIza-user" }
    });
    fireEvent.click(screen.getByRole("button", { name: "完成人机验证" }));
    fireEvent.click(screen.getByRole("button", { name: "开始导出" }));

    await waitFor(() => {
      expect(screen.getByText(/导出完成/)).toBeInTheDocument();
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

    expect(screen.getByText("2,626")).toBeInTheDocument();
    expect(screen.getByText("保留最完整的结构化原始数据，适合继续处理或接入脚本。")).toBeInTheDocument();

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
