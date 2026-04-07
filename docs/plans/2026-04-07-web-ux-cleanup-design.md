# Web-Only Cleanup And UX Upgrade Design

**Context:** The project has already been refocused into a deployable Next.js Web app, but the repository still contains legacy desktop and Python prototype files. The public site also needs a smoother first-run experience, clearer progress feedback, and a result view that is easier to screenshot and share.

## Goals

1. Make the repository clearly Web-only.
2. Reduce first-use friction for non-technical visitors.
3. Make export progress feel visible and trustworthy.
4. Turn the success state into something easier to understand and share.

## Options Considered

### Option 1: Keep legacy desktop and Python files in the main repo

- Pros: easy to reference old experiments
- Cons: project boundary stays blurry, docs stay harder to maintain, open-source story gets weaker

### Option 2: Move old files into an `archive/` directory

- Pros: preserves history in the working tree
- Cons: still leaves non-Web clutter in the active repo and README

### Option 3: Remove legacy desktop and Python artifacts from the mainline repo

- Pros: cleanest product story, clearer maintenance path, easier onboarding for contributors
- Cons: old implementations are only available through git history

**Recommendation:** Option 3. The git history already preserves the older approaches, so the main branch should represent the actual product direction.

## Product Design

### 1. Lower The Barrier To First Use

The page should explain the current workflow without making the user feel blocked by jargon.

- Add a lightweight onboarding area near the form.
- Explain why the page asks for a YouTube API key.
- Add a short "how to get an API key" checklist.
- Add a sample YouTube link button so users can try the flow immediately.
- Add more specific empty-state copy around what files will be generated and who this is for.

### 2. Make Export Progress More Perceptible

The current loading state confirms something is happening, but it does not help the user understand what stage the export is in.

- Replace the generic loading copy with a staged progress experience.
- Show a compact progress rail with four steps:
  - validating input
  - requesting comments
  - generating files
  - preparing downloads
- Use optimistic staged timing in the client so long waits feel guided rather than frozen.
- Keep the implementation simple and avoid pretending to show exact server-side percentages.

### 3. Make The Result View More Shareable

The result area should be understandable at a glance and screenshot-friendly for social sharing.

- Add a prominent success summary card.
- Highlight total comments, top-level comments, and replies.
- Add a "best for" label on each download type.
- Add a concise success banner that includes the exported video id and file readiness.
- Add a compact "what you can do next" strip, such as content analysis, spreadsheet filtering, or research use.

## Technical Design

### Repository Cleanup

Remove legacy files and references tied to the desktop/Python app:

- `YouTubeCommentsExporter.spec`
- `scripts/run_mac_app.py`
- `src/__init__.py`
- `src/mac_app.py`
- `src/youtube_comments_api.py`
- obsolete mac app planning docs
- obsolete preview output asset
- Python-only tests not relevant to the Web product

Retain only Web-relevant source, tests, and docs.

### Frontend Scope

Primary files expected to change:

- `app/page.tsx`
- `app/globals.css`
- `components/export-form.tsx`
- `components/export-results.tsx`
- possibly `lib/export-types.ts` if richer status metadata is needed

### Documentation Scope

Update:

- `README.md`
- `docs/architecture.md`
- `docs/deployment.md`
- `docs/environment-variables.md`
- new root-level `plan.md` for near-term execution tracking

## Error Handling

- If Turnstile is not configured, keep the current explicit message.
- If the user does not have an API key yet, the UI should guide rather than only block.
- Avoid adding fake progress percentages.

## Testing

- Update homepage and flow tests to reflect the new onboarding copy.
- Add tests for sample-link filling if implemented.
- Update loading-state tests if the progress UI changes.
- Run full Vitest suite and Next build after cleanup.

## Success Criteria

- The repository no longer looks like a mixed Web + desktop project.
- A new visitor can understand the API key requirement in one screen.
- The loading state feels guided rather than blank.
- The result area is clearer and more screenshot-friendly.
