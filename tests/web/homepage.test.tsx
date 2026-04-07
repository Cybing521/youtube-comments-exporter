/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import HomePage from "../../app/page";

vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: () => <div>Turnstile 占位</div>,
}));

describe("homepage", () => {
  it("renders the Chinese export shell", () => {
    render(<HomePage />);

    expect(screen.getByText("YouTube 评论导出")).toBeInTheDocument();
    expect(screen.getByText("第一次使用也能很快上手")).toBeInTheDocument();
    expect(screen.getByText("准备一个公开视频链接")).toBeInTheDocument();
    expect(screen.getByText("填入你自己的 YouTube API key")).toBeInTheDocument();
    expect(screen.getByText("完成人机验证并开始导出")).toBeInTheDocument();
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
});
