/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import HomePage from "../../apps/web/app/page";

describe("homepage", () => {
  it("renders the Chinese export shell", () => {
    render(<HomePage />);

    expect(screen.getByText("YouTube 评论导出")).toBeInTheDocument();
    expect(screen.getByLabelText("YouTube 链接")).toBeInTheDocument();
    expect(screen.getByLabelText("API 密钥")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始导出" })).toBeInTheDocument();
  });
});
