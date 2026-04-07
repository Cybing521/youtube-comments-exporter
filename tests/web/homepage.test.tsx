/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import HomePage from "../../app/page";

const SAVED_API_KEY_STORAGE = "youtube-comments-exporter-api-key";
const writeText = vi.fn(async () => undefined);

vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: () => <div>Turnstile 占位</div>,
}));

describe("homepage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    writeText.mockClear();
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });
  });

  it("renders the Chinese export shell", () => {
    render(<HomePage />);

    expect(screen.getByText("YouTube 评论导出")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "邮箱反馈" })).toBeInTheDocument();
    expect(screen.queryByText("在线导出工具")).not.toBeInTheDocument();
    expect(screen.queryByText("给我发需求或反馈")).not.toBeInTheDocument();
    expect(screen.getByText("贴链接")).toBeInTheDocument();
    expect(screen.getByText("填 API key")).toBeInTheDocument();
    expect(screen.getAllByText("开始导出").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("YouTube 链接")).toBeInTheDocument();
    expect(screen.getByLabelText("YouTube API Key")).toBeInTheDocument();
    expect(screen.getByText(/你的 API key 只用于本次导出请求/)).toBeInTheDocument();
    expect(screen.getByText(/还没有 API key/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "填入示例链接" })).toBeInTheDocument();
    expect(screen.getByText(/安全验证/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始导出" })).toBeInTheDocument();
  });

  it("fills the sample link into the url field", () => {
    render(<HomePage />);

    fireEvent.click(screen.getByRole("button", { name: "填入示例链接" }));

    expect(screen.getByLabelText("YouTube 链接")).toHaveValue("https://www.youtube.com/watch?v=gtEROmL0NzQ");
    expect(screen.getByText("示例链接已填入")).toBeInTheDocument();
  });

  it("copies the feedback email from the hero button", async () => {
    render(<HomePage />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "邮箱反馈" }));
    });

    expect(writeText).toHaveBeenCalledWith("cyibin06@gmail.com");
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "邮箱已复制" })).toBeInTheDocument();
    });
  });

  it("restores and persists the user's api key in local storage", () => {
    window.localStorage.setItem(SAVED_API_KEY_STORAGE, "AIza-saved");

    render(<HomePage />);

    const apiKeyInput = screen.getByLabelText("YouTube API Key");
    expect(apiKeyInput).toHaveValue("AIza-saved");

    fireEvent.change(apiKeyInput, {
      target: { value: "AIza-updated" },
    });

    expect(window.localStorage.getItem(SAVED_API_KEY_STORAGE)).toBe("AIza-updated");
  });
});
