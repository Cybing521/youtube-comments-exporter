# YouTube Comments Exporter Web

中文 Web 工具，用来把 YouTube 视频评论导出为：

- `JSON`
- `threaded Excel`
- `flat Excel`

这个仓库当前正从本地 Python 桌面原型迁移到可部署在 Vercel 的 Next.js Web 应用。

## Features

- 中文界面，适合直接给非技术用户使用
- 服务端导出，不暴露前端逻辑细节
- 支持一级评论和回复评论
- 生成三种导出产物
- 预留 Vercel Blob 上传和在线下载能力

## Project Structure

```text
apps/web                 Next.js 前端和 API 路由
packages/export-core     YouTube 评论抓取与导出核心
docs/plans               设计和实施计划
tests                    Web 侧测试与历史 Python 测试
src                       原始 Python 原型实现
```

## Environment Variables

复制 `.env.example` 并配置：

```bash
YOUTUBE_API_KEY=your_youtube_data_api_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## Local Development

```bash
pnpm install
pnpm --dir apps/web dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## Testing

运行当前 Web 侧测试：

```bash
pnpm vitest run tests/workspace/bootstrap.test.ts tests/web/homepage.test.tsx tests/web/export-flow.test.tsx tests/web/export-service.test.ts tests/export-core/export-comments.test.ts tests/export-core/artifacts.test.ts tests/api/export-route.test.ts
```

运行生产构建检查：

```bash
rm -rf apps/web/.next
pnpm --dir apps/web build
```

## Vercel Deployment

1. 把仓库推到 GitHub。
2. 在 Vercel 中 `Add New Project` 并导入仓库。
3. 配置环境变量：
   - `YOUTUBE_API_KEY`
   - `BLOB_READ_WRITE_TOKEN`
4. 先完成一次默认 `*.vercel.app` 生产部署。
5. 在旧项目里移除：
   - `www.cybing.top`
   - `cybing.top`
6. 在新项目里添加：
   - `www.cybing.top`
   - `cybing.top` -> 重定向到 `www.cybing.top`
7. 验证：
   - `https://www.cybing.top`
   - `https://cybing.top`
   - 页面发起一次真实导出

## Current Status

当前已经完成：

- Node workspace 和 Next.js Web 壳子
- TypeScript 版评论导出核心
- JSON / Excel 产物生成
- `/api/export` 路由骨架
- 前端提交与结果展示的最小交互

当前还没有完成的上线前事项：

- 真实 Blob 上传联调
- 真实 YouTube API 联调
- 更完整的 UI 打磨
- 开源项目补充 `LICENSE`、截图和部署文档
