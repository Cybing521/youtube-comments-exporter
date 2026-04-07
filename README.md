# YouTube Comments Exporter Web

中文 Web 工具，用来把 YouTube 视频评论导出为：

- `JSON`
- `threaded Excel`
- `flat Excel`

这个仓库已经整理成适合直接部署在 Vercel 的根目录 Next.js Web 应用，适合继续在线迭代和公开开源。

## Features

- 中文界面，适合直接给非技术用户使用
- 用户自己填写 YouTube Data API key，站点不代付配额
- 集成 Cloudflare Turnstile 人机验证
- 支持一级评论和回复评论
- 生成三种导出产物
- 支持 Vercel Blob 上传和在线下载能力
- 只保留 Web 版本，仓库结构已经按线上产品收缩

## Project Structure

```text
app                      Next.js App Router 页面和 API 路由
components               前端组件
lib                      YouTube 评论抓取、导出和 Blob 上传核心
docs                     架构、部署和计划文档
tests                    Web 侧测试
```

## Environment Variables

本地开发时，请在仓库根目录创建环境变量文件：

```bash
cp .env.example .env.local
```

然后在 `.env.local` 里填写：

```bash
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

## Local Development

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。
页面需要输入：

- YouTube 视频链接
- 用户自己的 YouTube Data API key
- Cloudflare Turnstile 验证

## Testing

运行当前 Web 侧测试：

```bash
pnpm vitest run tests/workspace/bootstrap.test.ts tests/web/homepage.test.tsx tests/web/export-flow.test.tsx tests/web/export-service.test.ts tests/export-core/export-comments.test.ts tests/export-core/artifacts.test.ts tests/api/export-route.test.ts
```

运行生产构建检查：

```bash
pnpm build
```

## Vercel Deployment

1. 把仓库推到 GitHub。
2. 在 Vercel 中 `Add New Project` 并导入仓库。
3. 保持 `Root Directory` 为空，直接使用仓库根目录作为 Next.js 应用根目录。
4. 配置环境变量：
   - `BLOB_READ_WRITE_TOKEN`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
5. 在项目中启用 Vercel Blob，确保 `BLOB_READ_WRITE_TOKEN` 出现在环境变量中。
6. 在 Cloudflare Turnstile 中把你的生产域名和本地域名加入允许名单。
7. 先完成一次默认 `*.vercel.app` 生产部署。
8. 验证默认域名页面可打开，并能在输入用户自己的 API key 后成功导出一次真实视频评论。

## Custom Domain Example

如果你要把这个项目切到自己的域名，可以按下面的方式做：

1. 在旧项目里移除原有域名。
2. 在新项目里添加你的正式域名。
3. 可选地把根域名重定向到 `www` 子域名。
4. 域名生效后，用正式域名再次跑一遍导出验证。

## Current Status

当前已经完成：

- Node workspace 和 Next.js Web 壳子
- TypeScript 版评论导出核心
- JSON / Excel 产物生成
- `/api/export` 路由和服务端环境变量接入
- 用户自填 API key + Turnstile 校验链路
- 前端提交、导出结果摘要和下载交互
- `README.md`、`.gitignore`、部署文档和环境变量文档

当前还没有完成的上线前事项：

- 在 Cloudflare Turnstile 后台补齐正式域名白名单
- 用真实 YouTube 视频和用户自己的 API key 做一次线上导出验证
