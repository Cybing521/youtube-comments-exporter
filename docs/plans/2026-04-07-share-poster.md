# 分享海报 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在导出成功后提供「生成分享海报」和「下载海报 PNG」能力，让用户可以单独生成更适合传播的海报。

**Architecture:** 在现有结果页 success 状态中增加一个延迟生成的海报动作。点击按钮后，页面展开一个固定比例的预览组件，同时在客户端使用 canvas 生成 PNG 下载链接。测试先覆盖按钮、展开态和下载入口，再补最小实现与样式。

**Tech Stack:** Next.js App Router、React、TypeScript、Vitest、Testing Library、原生 Canvas API、CSS 动画

---

### Task 1: 补分享海报的行为测试

**Files:**
- Modify: `tests/web/export-flow.test.tsx`

**Step 1: Write the failing test**

新增断言，要求导出成功后看到：

- `生成分享海报`
- 点击后出现 `分享海报预览`
- 出现 `下载海报 PNG`
- 预览中包含 `cybing.top` 和 `cyibin06@gmail.com`

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/export-flow.test.tsx`

Expected: FAIL because the new poster controls do not exist yet.

**Step 3: Commit**

先不提交，继续最小实现。

### Task 2: 实现最小海报交互

**Files:**
- Modify: `components/export-results.tsx`

**Step 1: Add poster state**

增加：

- `isPosterVisible`
- `posterDownloadUrl`
- `isPosterGenerating`

**Step 2: Add button and preview shell**

在 success 面板中加入：

- `生成分享海报`
- 点击后显示 `分享海报预览`
- 下载按钮占位

**Step 3: Run test to verify partial progress**

Run: `pnpm vitest run tests/web/export-flow.test.tsx`

Expected: 仍可能失败，但应接近通过。

### Task 3: 用 canvas 生成 PNG

**Files:**
- Modify: `components/export-results.tsx`

**Step 1: Create poster builder helper**

在组件文件内加入最小 helper：

- 创建 `canvas`
- 填充背景
- 绘制标题、数据、链接和邮箱
- 转成 `dataURL`

**Step 2: Wire download link**

将生成结果挂到：

- `下载海报 PNG`

**Step 3: Run targeted test**

Run: `pnpm vitest run tests/web/export-flow.test.tsx`

Expected: PASS

### Task 4: 补视觉和动画

**Files:**
- Modify: `app/globals.css`

**Step 1: Add poster preview styles**

增加：

- 固定比例海报容器
- 海报信息排版
- 操作按钮区

**Step 2: Add motion**

增加：

- 海报进入淡入上浮
- 按钮反馈
- reduced motion 兼容

**Step 3: Verify manually**

Run: `pnpm build`

Expected: PASS

### Task 5: 回归与上线检查

**Files:**
- Modify if needed: `tests/web/homepage.test.tsx`

**Step 1: Run full test suite**

Run: `pnpm test`

Expected: PASS

**Step 2: Run production build**

Run: `pnpm build`

Expected: PASS

**Step 3: Run Vercel prebuild**

Run: `pnpm dlx vercel build --prod --yes`

Expected: PASS

**Step 4: Commit**

```bash
git add components/export-results.tsx app/globals.css tests/web/export-flow.test.tsx docs/plans/2026-04-07-share-poster-design.md docs/plans/2026-04-07-share-poster.md
git commit -m "feat: add share poster generator"
```
