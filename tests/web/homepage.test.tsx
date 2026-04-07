/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import HomePage from "../../app/page";

vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: () => <div>Turnstile 占位</div>,
}));

describe("homepage", () => {
  it("renders the Chinese export shell", () => {
    render(<HomePage />);

    expect(screen.getByText("YouTube 评论导出")).toBeInTheDocument();
    expect(screen.getByLabelText("YouTube 链接")).toBeInTheDocument();
    expect(screen.getByLabelText("YouTube API Key")).toBeInTheDocument();
    expect(screen.getByText("粘贴一个视频链接，我们会为你准备 JSON、分层 Excel 和扁平 Excel 三份文件。")).toBeInTheDocument();
    expect(screen.getByText(/你的 API key 只用于本次导出请求/)).toBeInTheDocument();
    expect(screen.getByText(/安全验证/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始导出" })).toBeInTheDocument();
  });
});
