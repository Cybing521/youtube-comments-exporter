import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "小红书截图页 | YouTube 评论导出",
  description: "为小红书图文推广准备的截图素材页。",
};

const NOTE_PANELS = [
  {
    title: "YouTube 评论终于能直接导出 Excel 了",
    subtitle: "论文整理 / 评论分析 / 运营复盘",
    body: "贴一个公开视频链接，填自己的 API key，就能在线拿到 JSON、分层 Excel 和扁平 Excel。",
    accent: "封面图",
  },
  {
    title: "以前最麻烦的地方",
    subtitle: "不是抓不到，是普通人根本不好用",
    body: "很多方案要么字段不全，要么要装环境，要么还得自己写脚本。这个站点想解决的就是“普通用户也能直接导出”。",
    accent: "痛点页",
  },
  {
    title: "现在怎么用",
    subtitle: "三步就够",
    body: "贴 YouTube 链接 → 填自己的 API key → 完成人机验证。等几秒到几十秒，结果页会直接给下载按钮。",
    accent: "流程页",
  },
  {
    title: "导出后会拿到什么",
    subtitle: "三份文件，按场景用",
    body: "JSON 适合继续接脚本，分层 Excel 适合人工核对，扁平 Excel 适合筛选、透视和批量整理。",
    accent: "结果页",
  },
  {
    title: "更适合谁",
    subtitle: "不是程序员专属",
    body: "适合做论文、用户研究、内容分析、品牌评论整理的人。重复导出同一个视频时还会命中缓存，更快拿结果。",
    accent: "人群页",
  },
  {
    title: "站点链接",
    subtitle: "www.cybing.top",
    body: "如果你也会用到 YouTube 评论导出这个场景，可以直接试。想反馈需求，也可以发邮件到 cyibin06@gmail.com。",
    accent: "收尾页",
  },
];

export default function XiaohongshuPage() {
  return (
    <main className="promo-shell">
      <section className="promo-intro">
        <div>
          <p className="promo-kicker">Xiaohongshu Kit</p>
          <h1>小红书截图页</h1>
          <p>
            这页是给图文推广准备的。每张卡都按适合截图传播的版式做了，你可以直接整张截图当封面或内页素材。
          </p>
        </div>
        <a href="/" className="promo-home-link">
          返回主站
        </a>
      </section>

      <section className="promo-grid" aria-label="小红书截图素材">
        {NOTE_PANELS.map((panel) => (
          <article key={panel.title} className="promo-card">
            <div className="promo-card-top">
              <span className="promo-chip">{panel.accent}</span>
              <span className="promo-site">cybing.top</span>
            </div>
            <div className="promo-card-body">
              <h2>{panel.title}</h2>
              <p className="promo-card-subtitle">{panel.subtitle}</p>
              <p className="promo-card-copy">{panel.body}</p>
            </div>
            <div className="promo-card-footer">
              <span>YouTube 评论导出</span>
              <span>适合直接截图发笔记</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
