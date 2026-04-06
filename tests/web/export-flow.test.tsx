/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "../../apps/web/app/page";

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
    fireEvent.change(screen.getByLabelText("API 密钥"), {
      target: { value: "AIza-test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "开始导出" }));

    await waitFor(() => {
      expect(screen.getByText("导出完成")).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: "下载 JSON" })).toHaveAttribute(
      "href",
      "https://blob.example/json",
    );
    expect(screen.getByRole("link", { name: "下载分层 Excel" })).toHaveAttribute(
      "href",
      "https://blob.example/threaded",
    );
    expect(screen.getByRole("link", { name: "下载扁平 Excel" })).toHaveAttribute(
      "href",
      "https://blob.example/flat",
    );
  });
});
