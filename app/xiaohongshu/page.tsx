import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "小红书截图页 | YouTube 评论导出",
  description: "为小红书图文推广准备的截图素材页。",
};

const NOTE_PANELS = [
  {
    title: "我做了个网站",
    subtitle: "能把 YouTube 评论直接导出成 Excel",
    body: "不用本地装环境，不用自己写脚本。贴视频链接，填自己的 API key，就能在线拿到 JSON、分层 Excel 和扁平 Excel。",
    accent: "封面图",
    eyebrow: "建议直接当封面",
    kicker: "收藏备用",
    featured: true,
  },
  {
    title: "以前最麻烦的",
    subtitle: "不是抓不到，是普通人根本不好用",
    body: "很多方案要么字段不全，要么要装环境，要么还得自己写脚本。我想做的是一个普通用户也能直接上手的网页工具。",
    accent: "第 2 张",
    eyebrow: "痛点页",
    kicker: "别再手抄评论了",
  },
  {
    title: "现在怎么用",
    subtitle: "真的就 3 步",
    body: "贴 YouTube 链接 → 填自己的 API key → 完成人机验证。等几秒到几十秒，结果页会直接给下载按钮。",
    accent: "第 3 张",
    eyebrow: "流程页",
    kicker: "不用代码",
  },
  {
    title: "导出后直接拿到",
    subtitle: "3 份文件，按场景用",
    body: "JSON 适合继续接脚本，分层 Excel 适合人工核对，扁平 Excel 适合筛选、透视和批量整理。",
    accent: "第 4 张",
    eyebrow: "结果页",
    kicker: "可以直接下载",
  },
  {
    title: "更适合谁",
    subtitle: "不是程序员专属",
    body: "适合做论文、用户研究、内容分析、品牌评论整理的人。重复导出同一个视频时还会命中缓存，更快拿结果。",
    accent: "第 5 张",
    eyebrow: "人群页",
    kicker: "论文 / 运营 / 分析",
  },
  {
    title: "工具地址",
    subtitle: "www.cybing.top",
    body: "如果你也会用到 YouTube 评论导出这个场景，可以直接试。想反馈需求，也可以发邮件到 cyibin06@gmail.com。",
    accent: "第 6 张",
    eyebrow: "收尾页",
    kicker: "欢迎试用",
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
            这页是给图文推广准备的。第 1 张适合当封面，第 2 到第 6 张适合按顺序做正文，你可以直接整张截图发笔记。
          </p>
        </div>
        <div className="promo-intro-actions">
          <div className="promo-posting-tips" aria-label="发帖顺序建议">
            <span>封面</span>
            <span>痛点</span>
            <span>流程</span>
            <span>结果</span>
            <span>人群</span>
            <span>收尾</span>
          </div>
          <a href="/" className="promo-home-link">
            返回主站
          </a>
        </div>
      </section>

      <section className="promo-grid" aria-label="小红书截图素材">
        {NOTE_PANELS.map((panel) => (
          <article key={panel.title} className={`promo-card${panel.featured ? " promo-card-featured" : ""}`}>
            <div className="promo-card-top">
              <span className="promo-chip">{panel.accent}</span>
              <span className="promo-site">cybing.top</span>
            </div>
            <div className="promo-card-body">
              <span className="promo-card-eyebrow">{panel.eyebrow}</span>
              <h2>{panel.title}</h2>
              <p className="promo-card-subtitle">{panel.subtitle}</p>
              <p className="promo-card-copy">{panel.body}</p>
            </div>
            <div className="promo-card-footer">
              <span>{panel.kicker}</span>
              <span>YouTube 评论导出</span>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
