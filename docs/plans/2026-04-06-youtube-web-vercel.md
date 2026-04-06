# YouTube Comments Web + Vercel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Chinese-language web app that exports YouTube comments online, deploy it to Vercel under `www.cybing.top`, and package the repo as an open-source GitHub project.

**Architecture:** Use a Next.js App Router app deployed on Vercel. Move the verified exporter logic from the current Python prototype into a TypeScript server-side export core so it can run natively inside Vercel Functions, generate `JSON + threaded Excel + flat Excel`, upload artifacts to Vercel Blob, and return downloadable URLs to the UI.

**Tech Stack:** Next.js, TypeScript, React, Tailwind CSS, Vercel Functions, Vercel Blob, XLSX generation library, Vitest, Playwright, GitHub, Vercel.

---

### Task 1: Re-baseline the Repository for a Web Product

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `vercel.json`
- Create: `.env.example`
- Modify: `docs/plans/2026-04-06-youtube-web-vercel.md`
- Keep for reference: `src/youtube_comments_api.py`

**Step 1: Write the failing test**

Create a repository smoke test that asserts the new workspace files exist and the package manager scripts are discoverable.

```ts
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("workspace bootstrap", () => {
  it("defines the core project files", () => {
    expect(existsSync("package.json")).toBe(true);
    expect(existsSync("pnpm-workspace.yaml")).toBe(true);
    expect(existsSync("README.md")).toBe(true);
    expect(existsSync(".gitignore")).toBe(true);
  });

  it("exposes web lifecycle scripts", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.scripts.dev).toBeTruthy();
    expect(pkg.scripts.build).toBeTruthy();
    expect(pkg.scripts.test).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/workspace/bootstrap.test.ts`
Expected: FAIL because the workspace files and script definitions do not exist yet.

**Step 3: Write minimal implementation**

- Initialize a Node workspace for the web app.
- Add scripts for `dev`, `build`, `test`, `lint`, and `test:e2e`.
- Add `.gitignore` entries for:
  - `.next`
  - `.vercel`
  - `node_modules`
  - `dist`
  - `build`
  - `output`
  - `*.pyc`
  - `.DS_Store`
  - `.env*`
- Add `.env.example` with placeholder keys for:
  - `YOUTUBE_API_KEY`
  - `BLOB_READ_WRITE_TOKEN`

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/workspace/bootstrap.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git init
git add package.json pnpm-workspace.yaml README.md .gitignore .env.example vercel.json tests/workspace/bootstrap.test.ts
git commit -m "chore: bootstrap web workspace"
```

### Task 2: Scaffold the Next.js App and Base UI Shell

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/postcss.config.js`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/components/export-form.tsx`
- Create: `apps/web/components/export-results.tsx`
- Create: `tests/web/homepage.test.tsx`

**Step 1: Write the failing test**

Create a React test that expects a Chinese homepage with:
- title text
- URL input
- API key input
- output action button

```tsx
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

it("renders the Chinese export shell", () => {
  render(<HomePage />);
  expect(screen.getByText("YouTube 评论导出")).toBeInTheDocument();
  expect(screen.getByLabelText("YouTube 链接")).toBeInTheDocument();
  expect(screen.getByLabelText("API 密钥")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "开始导出" })).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/homepage.test.tsx`
Expected: FAIL because the app shell does not exist yet.

**Step 3: Write minimal implementation**

- Scaffold a Next.js App Router app in `apps/web`
- Build a simple Chinese first screen with:
  - page title
  - subtitle
  - input form
  - placeholder result area
- Keep styling clean and light; no dark default theme

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/homepage.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web tests/web/homepage.test.tsx
git commit -m "feat: scaffold next web shell"
```

### Task 3: Port the Export Core from Python to TypeScript

**Files:**
- Create: `packages/export-core/package.json`
- Create: `packages/export-core/src/types.ts`
- Create: `packages/export-core/src/youtube.ts`
- Create: `packages/export-core/src/normalize.ts`
- Create: `packages/export-core/src/export-comments.ts`
- Create: `tests/export-core/export-comments.test.ts`
- Reference only: `src/youtube_comments_api.py`

**Step 1: Write the failing test**

Create a unit test that reproduces the current Python exporter behavior:
- paginates top-level comments
- backfills missing replies
- preserves counts

```ts
it("paginates threads and backfills replies", async () => {
  const client = new FakeYouTubeClient();
  const result = await exportVideoComments(client, "video-1", "time");

  expect(result.videoId).toBe("video-1");
  expect(result.summary.topLevelCommentCount).toBe(2);
  expect(result.summary.replyCount).toBe(2);
  expect(result.summary.totalCommentCount).toBe(4);
  expect(result.threads[0].replies.map((r) => r.commentId)).toEqual(["reply-1", "reply-2"]);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/export-core/export-comments.test.ts`
Expected: FAIL because the TS exporter does not exist yet.

**Step 3: Write minimal implementation**

- Port these behaviors from Python:
  - extract video ID
  - normalize threads
  - normalize replies
  - paginate comment threads
  - backfill replies with `parentId`
  - compute summary counts
- Use plain fetch-based YouTube API client
- Keep output shape deterministic and serializable

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/export-core/export-comments.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/export-core tests/export-core/export-comments.test.ts
git commit -m "feat: port youtube exporter to typescript"
```

### Task 4: Generate JSON and Excel Artifacts in the Web Runtime

**Files:**
- Create: `packages/export-core/src/excel.ts`
- Create: `packages/export-core/src/artifacts.ts`
- Create: `tests/export-core/artifacts.test.ts`

**Step 1: Write the failing test**

Create a test that verifies:
- flat Excel contains one row per top-level comment or reply
- threaded Excel contains `Summary`, `Threads`, and `Replies`
- JSON artifact is generated with expected shape

```ts
it("builds json and both excel artifacts", async () => {
  const artifacts = await buildExportArtifacts(sampleExport);
  expect(artifacts.json.filename).toContain(".comments.json");
  expect(artifacts.threadedExcel.filename).toContain(".comments.xlsx");
  expect(artifacts.flatExcel.filename).toContain(".flat.xlsx");
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/export-core/artifacts.test.ts`
Expected: FAIL because artifact builders do not exist yet.

**Step 3: Write minimal implementation**

- Add a JSON artifact builder
- Add an XLSX artifact builder for:
  - `Summary`
  - `Threads`
  - `Replies`
- Add a flat Excel artifact builder
- Ensure file names match the current naming style:
  - `<videoId>.<order>.comments.json`
  - `<videoId>.<order>.comments.xlsx`
  - `<videoId>.<order>.comments.flat.xlsx`

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/export-core/artifacts.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/export-core/src/artifacts.ts packages/export-core/src/excel.ts tests/export-core/artifacts.test.ts
git commit -m "feat: add export artifact generation"
```

### Task 5: Add Blob Upload and the Export API

**Files:**
- Create: `apps/web/app/api/export/route.ts`
- Create: `apps/web/lib/blob.ts`
- Create: `apps/web/lib/export-service.ts`
- Create: `tests/api/export-route.test.ts`
- Modify: `vercel.json`

**Step 1: Write the failing test**

Create an API test that posts a YouTube URL and expects:
- success response
- summary counts
- download URLs for JSON, threaded Excel, and flat Excel

```ts
it("returns export summary and blob urls", async () => {
  const response = await POST(makeRequest({
    url: "https://www.youtube.com/watch?v=gtEROmL0NzQ",
    apiKey: "AIza-test"
  }));

  const data = await response.json();
  expect(response.status).toBe(200);
  expect(data.files.jsonUrl).toMatch(/^https?:\\/\\//);
  expect(data.files.threadedExcelUrl).toMatch(/^https?:\\/\\//);
  expect(data.files.flatExcelUrl).toMatch(/^https?:\\/\\//);
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/api/export-route.test.ts`
Expected: FAIL because the route and upload layer do not exist yet.

**Step 3: Write minimal implementation**

- Create a POST export endpoint
- Validate request body
- Call the TypeScript export core
- Upload generated files to Vercel Blob
- Return:
  - summary
  - file URLs
  - video ID
  - order
- Add `vercel.json` function duration for `app/api/**/*`

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/api/export-route.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/app/api/export/route.ts apps/web/lib/blob.ts apps/web/lib/export-service.ts vercel.json tests/api/export-route.test.ts
git commit -m "feat: add online export api"
```

### Task 6: Complete the Chinese Frontend Flow

**Files:**
- Modify: `apps/web/app/page.tsx`
- Modify: `apps/web/components/export-form.tsx`
- Modify: `apps/web/components/export-results.tsx`
- Create: `apps/web/components/status-log.tsx`
- Create: `apps/web/components/download-card.tsx`
- Create: `tests/web/export-flow.test.tsx`

**Step 1: Write the failing test**

Create a UI test that verifies:
- user can enter a URL
- user can submit the form
- loading state appears
- result cards render returned file URLs

```tsx
it("submits export and shows download links", async () => {
  render(<HomePage />);
  await user.type(screen.getByLabelText("YouTube 链接"), "https://www.youtube.com/watch?v=gtEROmL0NzQ");
  await user.click(screen.getByRole("button", { name: "开始导出" }));

  expect(await screen.findByText("导出完成")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "下载 JSON" })).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/export-flow.test.tsx`
Expected: FAIL because the interactive flow is incomplete.

**Step 3: Write minimal implementation**

- Add controlled Chinese form inputs
- Add inline validation
- Add loading and error states
- Add result cards for:
  - JSON
  - 分层 Excel
  - 扁平 Excel
- Add restrained motion only where it improves feedback

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/export-flow.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add apps/web/app/page.tsx apps/web/components/export-form.tsx apps/web/components/export-results.tsx apps/web/components/status-log.tsx apps/web/components/download-card.tsx tests/web/export-flow.test.tsx
git commit -m "feat: finish chinese export flow"
```

### Task 7: Add End-to-End Verification and Self-Test Harness

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/export.spec.ts`
- Create: `scripts/smoke-export.ts`
- Create: `scripts/check-release.ts`

**Step 1: Write the failing test**

Create an end-to-end test that:
- opens the home page
- submits a sample export request
- waits for the result state
- verifies the three download links exist

**Step 2: Run test to verify it fails**

Run: `pnpm playwright test tests/e2e/export.spec.ts`
Expected: FAIL because the e2e harness and release checks do not exist yet.

**Step 3: Write minimal implementation**

- Add Playwright config
- Add e2e test
- Add release smoke script that runs:
  - unit tests
  - build
  - e2e test
- Add a release gate script that exits non-zero on any failure

**Step 4: Run test to verify it passes**

Run: `pnpm test`
Expected: PASS

**Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e/export.spec.ts scripts/smoke-export.ts scripts/check-release.ts
git commit -m "test: add release verification flow"
```

### Task 8: Prepare the Open-Source Project Surface

**Files:**
- Modify: `README.md`
- Modify: `.gitignore`
- Create: `LICENSE`
- Create: `docs/architecture.md`
- Create: `docs/deployment.md`
- Create: `docs/environment-variables.md`

**Step 1: Write the failing test**

Create a documentation test that checks README includes:
- project purpose
- feature list
- local development
- Vercel deployment
- environment variables

```ts
it("documents setup and deployment", () => {
  const readme = readFileSync("README.md", "utf8");
  expect(readme).toContain("Features");
  expect(readme).toContain("Local Development");
  expect(readme).toContain("Vercel Deployment");
  expect(readme).toContain("Environment Variables");
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/workspace/readme.test.ts`
Expected: FAIL because the open-source docs are incomplete.

**Step 3: Write minimal implementation**

- Write a real `README.md` with:
  - overview
  - screenshots placeholder
  - architecture summary
  - local setup
  - deployment steps
  - domain switch checklist
- Add `LICENSE`
- Add deployment docs for Vercel

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/workspace/readme.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md .gitignore LICENSE docs/architecture.md docs/deployment.md docs/environment-variables.md tests/workspace/readme.test.ts
git commit -m "docs: prepare open source project"
```

### Task 9: Deploy to Vercel and Switch the Domain

**Files:**
- Verify: `apps/web`
- Verify: `vercel.json`
- Verify: `.env.example`
- Verify: `docs/deployment.md`

**Step 1: Write the deployment checklist**

Document the exact release checklist in `docs/deployment.md`:
- create GitHub repo
- push default branch
- import repo into Vercel
- set env vars
- deploy once to `*.vercel.app`
- remove `www.cybing.top` and `cybing.top` from the old `particle-system` project
- add `www.cybing.top` to the new project
- add `cybing.top` as redirect to `www.cybing.top`
- verify production access

**Step 2: Run pre-deploy verification**

Run:
- `pnpm install`
- `pnpm test`
- `pnpm build`

Expected: all commands PASS

**Step 3: Deploy**

Run:

```bash
vercel
vercel --prod
```

Expected:
- preview deploy succeeds
- production deploy succeeds

**Step 4: Switch the domain in Vercel**

Do this in the Vercel dashboard:
1. Open old project `particle-system`
2. Remove `www.cybing.top`
3. Remove `cybing.top`
4. Open the new project
5. Add `www.cybing.top`
6. Add `cybing.top` and configure redirect to `www.cybing.top`

**Step 5: Verify**

Check:
- `https://www.cybing.top`
- `https://cybing.top`
- one real export request from the browser
- all three files download correctly

**Step 6: Commit deployment docs updates**

```bash
git add docs/deployment.md README.md
git commit -m "docs: finalize vercel deployment guide"
```
