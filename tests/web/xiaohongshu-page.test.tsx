/** @vitest-environment jsdom */

import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import XiaohongshuPage from "../../app/xiaohongshu/page";

describe("xiaohongshu page", () => {
  it("renders screenshot-friendly note panels", async () => {
    render(await XiaohongshuPage({}));

    expect(screen.getByText("小红书截图页")).toBeInTheDocument();
    expect(screen.getByText("我做了个网站")).toBeInTheDocument();
    expect(screen.getByText("以前最麻烦的")).toBeInTheDocument();
    expect(screen.getByText("工具地址")).toBeInTheDocument();
    expect(screen.getByText("封面")).toBeInTheDocument();
    expect(screen.queryByText("封面图")).not.toBeInTheDocument();
    expect(screen.queryByText("收尾页")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回主站" })).toHaveAttribute("href", "/");
  });

  it("renders a single poster card when panel mode is used", async () => {
    render(
      await XiaohongshuPage({
        searchParams: Promise.resolve({ panel: "2" }),
      }),
    );

    expect(screen.queryByText("小红书截图页")).not.toBeInTheDocument();
    expect(screen.getByText("以前最麻烦的")).toBeInTheDocument();
    expect(screen.queryByText("我做了个网站")).not.toBeInTheDocument();
  });
});
