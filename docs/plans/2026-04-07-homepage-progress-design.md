# 2026-04-07 Homepage Compression + Real Progress Design

## Goal

把首页继续压缩成“打开就能用”的形态，同时把导出进度改成由服务端真实回传，减少用户误判为卡死的情况。

## Why This Iteration

- 当前首屏仍然有双层解释结构，输入区之前的信息偏多。
- 当前“导出中”步骤由前端按时间推测，和真实后端执行不同步。
- 对评论较多的视频，用户会在“准备下载结果”停留很久，看起来像卡住。

## UX Direction

### 1. Homepage

- Hero 只保留：标题、一句副标题、一个反馈按钮、少量能力标签。
- 删除右侧价值说明卡，避免把“第一次来也能直接用”重复讲两遍。
- Quickstart 从 3 张卡压缩成一行步骤文案：
  - `贴链接`
  - `填 API key`
  - `开始导出`
- 保留示例链接按钮和 API key 折叠帮助，但把它们放在更轻的辅助层级。

### 2. Progress

- 进度来源改为服务端真实事件，不再由前端按秒切换步骤。
- 前端只负责：
  - 展示当前阶段标题和说明
  - 展示已等待秒数
  - 在长耗时时展示安抚文案
- 服务端阶段建议：
  - `正在校验输入信息`
  - `正在请求评论数据`
  - `正在补全回复内容`
  - `正在生成导出文件`
  - `正在准备下载结果`

### 3. Result Continuity

- 保持现有成功页和分享海报入口，不再新增额外解释区。
- 成功页继续作为下载和分享中心。

## Technical Design

### Streaming protocol

- `POST /api/export` 改为返回 `text/plain; charset=utf-8`
- 使用 NDJSON 风格逐行返回事件
- 事件结构：
  - `{"type":"progress","stage":"fetching-comments","title":"正在请求评论数据","detail":"..."}`
  - `{"type":"success","result":{...ExportResponse}}`
  - `{"type":"error","error":"..."}`

### Frontend request handling

- `submitExportRequest` 增加 `onProgress` 回调
- 读取 `response.body` 的流并逐行解析 JSON
- 收到 `progress` 时更新页面阶段
- 收到 `success` 时返回最终结果
- 收到 `error` 时直接抛出错误

### Service callbacks

- `runExportAndUpload` 增加 `onProgress`
- 在以下步骤触发阶段：
  - URL / token 校验完成后
  - 开始拉取评论
  - 开始补全回复
  - 开始生成 JSON / Excel
  - 开始上传 Blob

## Risks

- 流式响应在测试环境和 Vercel Node runtime 上都要兼容。
- 如果某一步实际耗时过短，阶段切换可能非常快，需要避免动画过重。
- 现有测试依赖前端假进度，需要整体改写。

## Verification

- 单测覆盖首页压缩后的文案
- 单测覆盖流式 progress 解析
- 单测覆盖成功 / 错误事件
- `pnpm test`
- `pnpm build`
- `pnpm dlx vercel build --prod --yes`
