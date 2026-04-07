# 2026-04-07 Homepage Compression + Real Progress Implementation Plan

## Scope

- 压缩首页首屏与 quickstart 引导
- 把导出进度改为服务端真实流式阶段
- 保持成功结果页和分享海报能力不回退

## Steps

1. 更新设计文档与总计划
2. 改测试
   - 首页结构断言
   - 流式导出进度断言
   - API route 流式响应断言
3. 实现前端请求流解析
4. 实现 API route 流式事件输出
5. 在服务层增加真实进度回调
6. 调整页面与样式
7. 跑测试与构建
8. 推送并部署

## Done Criteria

- 首屏明显更短，右侧说明卡已移除
- Quickstart 收敛成简洁步骤，不再出现 3 张引导卡
- 导出阶段由后端事件驱动，不再按前端秒数切换
- 成功与失败路径都能正确结束
- 测试和构建全部通过
