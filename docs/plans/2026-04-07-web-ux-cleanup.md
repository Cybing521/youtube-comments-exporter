# Web-Only Cleanup And UX Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove legacy desktop/Python artifacts and improve the Web app's onboarding, progress feedback, and shareability.

**Architecture:** Keep the current Next.js application as the only product surface. Clean the repository first, then improve the single-page experience in small TDD-driven slices so the public flow stays stable while UX improves.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Cloudflare Turnstile, Vercel Blob

---

### Task 1: Remove Legacy Desktop And Python Artifacts

**Files:**
- Delete: `YouTubeCommentsExporter.spec`
- Delete: `scripts/run_mac_app.py`
- Delete: `src/__init__.py`
- Delete: `src/mac_app.py`
- Delete: `src/youtube_comments_api.py`
- Delete: `tests/test_youtube_comments_api.py`
- Delete: `output/mac_app_preview.png`
- Modify: `README.md`
- Modify: `docs/architecture.md`

**Step 1: Review references to deleted artifacts**

Run:

```bash
rg -n "mac_app|youtube_comments_api|YouTubeCommentsExporter|Python prototype|desktop" .
```

Expected: locate docs and stale references before deletion.

**Step 2: Remove obsolete files**

Run:

```bash
rm -f YouTubeCommentsExporter.spec scripts/run_mac_app.py src/__init__.py src/mac_app.py src/youtube_comments_api.py tests/test_youtube_comments_api.py output/mac_app_preview.png
```

Expected: files are removed from the working tree.

**Step 3: Update docs to present the project as Web-only**

- Remove desktop/Python references from `README.md`
- Update architecture summary in `docs/architecture.md`

**Step 4: Verify cleanup**

Run:

```bash
git status --short
```

Expected: only intended deletions and doc updates appear.

**Step 5: Commit**

```bash
git add README.md docs/architecture.md YouTubeCommentsExporter.spec scripts/run_mac_app.py src/__init__.py src/mac_app.py src/youtube_comments_api.py tests/test_youtube_comments_api.py output/mac_app_preview.png
git commit -m "refactor: remove legacy desktop and python artifacts"
```

### Task 2: Add First-Run Guidance And Lower-Friction Onboarding

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/export-form.tsx`
- Modify: `app/globals.css`
- Test: `tests/web/homepage.test.tsx`
- Test: `tests/web/export-flow.test.tsx`

**Step 1: Write failing tests for onboarding copy and helper actions**

Add expectations for:

- API key explainer copy
- a short "how to get API key" checklist or disclosure
- optional sample-link action if implemented

**Step 2: Run targeted tests to confirm failure**

Run:

```bash
pnpm vitest run tests/web/homepage.test.tsx tests/web/export-flow.test.tsx
```

Expected: FAIL because the new onboarding content does not exist yet.

**Step 3: Implement the minimal onboarding UI**

- Add a compact onboarding panel
- Add API key explanation copy
- Add sample link autofill
- Keep the primary page focused on one export action

**Step 4: Re-run targeted tests**

Run:

```bash
pnpm vitest run tests/web/homepage.test.tsx tests/web/export-flow.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add app/page.tsx components/export-form.tsx app/globals.css tests/web/homepage.test.tsx tests/web/export-flow.test.tsx
git commit -m "feat: improve export onboarding flow"
```

### Task 3: Make Export Progress More Perceptible

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/export-results.tsx`
- Modify: `app/globals.css`
- Test: `tests/web/export-flow.test.tsx`

**Step 1: Write the failing test for staged loading feedback**

Add assertions for staged status messaging such as:

- 正在校验信息
- 正在请求评论
- 正在生成文件
- 正在准备下载

**Step 2: Run the focused test**

Run:

```bash
pnpm vitest run tests/web/export-flow.test.tsx
```

Expected: FAIL because loading still shows a generic message.

**Step 3: Implement staged progress UI**

- Track transient client-side progress steps while the request is in flight
- Render a progress rail in the results area
- Keep the implementation simple and deterministic

**Step 4: Re-run the focused test**

Run:

```bash
pnpm vitest run tests/web/export-flow.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add app/page.tsx components/export-results.tsx app/globals.css tests/web/export-flow.test.tsx
git commit -m "feat: add staged export progress feedback"
```

### Task 4: Redesign The Success State For Sharing

**Files:**
- Modify: `components/export-results.tsx`
- Modify: `app/globals.css`
- Test: `tests/web/export-flow.test.tsx`

**Step 1: Write the failing test for richer success content**

Add expectations for:

- success banner copy
- structured summary card
- "best for" style helper copy on downloads
- a small "next actions" strip

**Step 2: Run the focused test**

Run:

```bash
pnpm vitest run tests/web/export-flow.test.tsx
```

Expected: FAIL because the current success state is still minimal.

**Step 3: Implement the success redesign**

- Add a highlight card for totals
- Add better hierarchy to downloads
- Add screenshot-friendly framing

**Step 4: Re-run the focused test**

Run:

```bash
pnpm vitest run tests/web/export-flow.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/export-results.tsx app/globals.css tests/web/export-flow.test.tsx
git commit -m "feat: redesign export results for sharing"
```

### Task 5: Add A Root-Level Working Plan And Refresh Docs

**Files:**
- Create: `plan.md`
- Modify: `README.md`
- Modify: `docs/deployment.md`
- Modify: `docs/environment-variables.md`

**Step 1: Create `plan.md`**

Include:

- current objective
- completed items
- next milestones
- deployment checklist

**Step 2: Refresh docs**

Make sure all docs reflect:

- Web-only scope
- user-provided API key flow
- Turnstile requirement
- improved onboarding and result UX

**Step 3: Run documentation sanity checks**

Run:

```bash
pnpm vitest run tests/workspace/readme.test.ts
```

Expected: PASS

**Step 4: Commit**

```bash
git add plan.md README.md docs/deployment.md docs/environment-variables.md
git commit -m "docs: add rollout plan for web-only product"
```

### Task 6: Final Verification

**Files:**
- Verify current workspace

**Step 1: Run tests**

```bash
pnpm test
```

Expected: PASS

**Step 2: Run production build**

```bash
pnpm build
```

Expected: PASS

**Step 3: Run Vercel prebuild**

```bash
pnpm dlx vercel build --prod --yes
```

Expected: PASS

**Step 4: Commit final polish if needed**

```bash
git add .
git commit -m "chore: finalize web-only ux upgrade"
```
