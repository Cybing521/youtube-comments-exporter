# User API Key + Turnstile Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Require each user to bring their own YouTube Data API key and complete Cloudflare Turnstile verification before an export request is processed.

**Architecture:** Keep the current Next.js + Vercel server flow, but change the request contract so the client always submits `apiKey` and `turnstileToken`. Validate Turnstile server-side via Cloudflare Siteverify before calling the export service. Render the widget client-side with `@marsidev/react-turnstile`.

**Tech Stack:** Next.js App Router, React, TypeScript, Cloudflare Turnstile, `@marsidev/react-turnstile`, Vercel Functions, Vitest.

---

### Task 1: Update the Request Contract

**Files:**
- Modify: `lib/export-types.ts`
- Modify: `lib/export-request.ts`
- Test: `tests/api/export-route.test.ts`

**Step 1: Write the failing test**

Add request validation expectations for missing API key and missing Turnstile token.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/api/export-route.test.ts`
Expected: FAIL because the request type and validation do not require these fields yet.

**Step 3: Write minimal implementation**

- Extend `ExportRequestInput` with:
  - `apiKey: string`
  - `turnstileToken: string`
- Update `submitExportRequest()` to send both fields unchanged.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/api/export-route.test.ts`
Expected: PASS for the new request shape expectations.

### Task 2: Add Turnstile Server Verification

**Files:**
- Create: `lib/turnstile.ts`
- Modify: `lib/handle-export-request.ts`
- Test: `tests/api/export-route.test.ts`

**Step 1: Write the failing test**

Add tests for:
- missing token -> validation error
- failed verification -> validation error
- successful verification -> export proceeds

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/api/export-route.test.ts`
Expected: FAIL because Turnstile verification does not exist.

**Step 3: Write minimal implementation**

- Create `verifyTurnstileToken()` that:
  - reads `TURNSTILE_SECRET_KEY`
  - posts token to Cloudflare Siteverify
  - returns success/failure details
- Inject verification into `handleExportRequest()`
- Remove fallback to `process.env.YOUTUBE_API_KEY`; require explicit user key

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/api/export-route.test.ts`
Expected: PASS

### Task 3: Render the API Key Field and Turnstile Widget

**Files:**
- Modify: `components/export-form.tsx`
- Modify: `app/page.tsx`
- Test: `tests/web/homepage.test.tsx`
- Test: `tests/web/export-flow.test.tsx`

**Step 1: Write the failing test**

Update UI tests so the page must show:
- `YouTube API Key` input
- Turnstile area
- correct submission payload

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/web/homepage.test.tsx tests/web/export-flow.test.tsx`
Expected: FAIL because the current UI has no API key field or Turnstile integration.

**Step 3: Write minimal implementation**

- Add API key field with Chinese helper copy
- Add Turnstile widget with client-side token state
- Disable submit until URL, API key, and token all exist
- Reset token when submission fails

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/web/homepage.test.tsx tests/web/export-flow.test.tsx`
Expected: PASS

### Task 4: Add Config and Documentation

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `docs/environment-variables.md`
- Modify: `docs/deployment.md`
- Test: `tests/workspace/readme.test.ts`

**Step 1: Write the failing test**

Update docs expectations to mention:
- user-provided API key flow
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/workspace/readme.test.ts`
Expected: FAIL because docs do not mention the new setup.

**Step 3: Write minimal implementation**

- Add Turnstile env vars to `.env.example`
- Update README and deployment docs
- Explain that end users must bring their own YouTube API key
- Explain that Turnstile site/secret keys belong to the site owner

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/workspace/readme.test.ts`
Expected: PASS

### Task 5: Full Verification

**Files:**
- Verify only

**Step 1: Run targeted tests**

Run:
- `pnpm vitest run tests/api/export-route.test.ts`
- `pnpm vitest run tests/web/homepage.test.tsx tests/web/export-flow.test.tsx`

Expected: PASS

**Step 2: Run full suite**

Run: `pnpm test`
Expected: PASS

**Step 3: Run production build**

Run: `pnpm build`
Expected: PASS

**Step 4: Run Vercel build**

Run: `pnpm dlx vercel build --prod --yes`
Expected: PASS
