# Web Product Plan

## Current Goal

把项目彻底收成一个更容易传播和维护的 Web 工具，并提升第一次使用体验。

## Product Direction

- 只保留 Web 版本
- 用户自填 YouTube API key
- 使用 Turnstile 做基础人机验证
- 强化首次使用引导、导出过程反馈和导出成功展示

## Work Nodes

### Phase 1: Repo Cleanup

- 删除桌面端和 Python 原型残留
- 清理 README 和架构文档中的旧描述
- 让仓库边界变成纯 Web 项目

### Phase 2: Lower Friction

- 增加 API key 获取引导
- 增加示例链接或一键试用入口
- 明确解释为什么要用户填写自己的 API key

### Phase 3: Better Progress Feedback

- 将“导出中”拆成多个可理解阶段
- 用更明显的视觉状态降低等待焦虑
- 保持实现简单，不做伪精确进度

### Phase 4: Shareable Result Page

- 重做导出成功区
- 强化总评论数、一级评论数、回复数
- 让成功结果更适合截图传播

### Phase 5: Share Poster

- 在导出成功后提供 `生成分享海报` 动作
- 生成单独的纵向传播海报，而不是继续拉长结果页
- 提供下载 PNG 的能力

### Phase 6: Final Verification

- `pnpm test`
- `pnpm build`
- `pnpm dlx vercel build --prod --yes`
- 线上验证 `www.cybing.top`

## Completed Already

- Vercel Web 站点已上线
- 自定义域名已切换
- 用户自填 API key 流程已接入
- Cloudflare Turnstile 已接入

## Immediate Next Step

先继续把“导出完成后的传播动作”做完整，再考虑更深的分享链路。
