# YouTube Comments Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a minimal Python tool that exports a video's full comment tree available from the official YouTube Data API and compares the export against a known page-visible thread.

**Architecture:** A small stdlib-only client will call `commentThreads.list` for top-level threads and `comments.list` for missing replies. A normalization layer will emit a stable JSON schema, and a comparison helper will search for page-visible threads by author/text.

**Tech Stack:** Python 3.9, `unittest`, `urllib`, JSON.

---

### Task 1: Project Skeleton

**Files:**
- Create: `src/youtube_comments_api.py`
- Create: `scripts/export_video_comments.py`
- Create: `tests/test_youtube_comments_api.py`

**Step 1: Write the failing test**

- Add a unit test for top-level normalization from one API thread item.

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests/test_youtube_comments_api.py -v`
Expected: FAIL because module and functions do not exist.

**Step 3: Write minimal implementation**

- Add the normalization function and smallest schema needed for the test.

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests/test_youtube_comments_api.py -v`
Expected: PASS.

### Task 2: Thread Pagination And Reply Backfill

**Files:**
- Modify: `src/youtube_comments_api.py`
- Modify: `tests/test_youtube_comments_api.py`

**Step 1: Write the failing test**

- Add a unit test that simulates paginated thread responses and reply backfill when `totalReplyCount` exceeds embedded replies.

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests/test_youtube_comments_api.py -v`
Expected: FAIL because pagination/backfill is missing.

**Step 3: Write minimal implementation**

- Implement API client methods for `commentThreads.list` and `comments.list`.
- Implement export assembly.

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests/test_youtube_comments_api.py -v`
Expected: PASS.

### Task 3: Real Export CLI

**Files:**
- Modify: `scripts/export_video_comments.py`
- Modify: `src/youtube_comments_api.py`

**Step 1: Write the failing test**

- Add a unit test for parsing a YouTube URL to `videoId`.

**Step 2: Run test to verify it fails**

Run: `python3 -m unittest tests/test_youtube_comments_api.py -v`
Expected: FAIL because parsing helper is missing.

**Step 3: Write minimal implementation**

- Add URL parsing helper.
- Add a CLI script that reads `YOUTUBE_API_KEY`, exports JSON, and optionally writes a comparison report.

**Step 4: Run test to verify it passes**

Run: `python3 -m unittest tests/test_youtube_comments_api.py -v`
Expected: PASS.

### Task 4: Real Run And Comparison

**Files:**
- Output: `output/gtEROmL0NzQ.relevance.comments.json`
- Output: `output/gtEROmL0NzQ.relevance.compare.json`

**Step 1: Run real export**

Run:
`YOUTUBE_API_KEY=... python3 scripts/export_video_comments.py --url 'https://www.youtube.com/watch?v=gtEROmL0NzQ&list=RDgtEROmL0NzQ&start_radio=1' --output output/gtEROmL0NzQ.relevance.comments.json`

**Step 2: Run comparison**

Run the same script with screenshot thread expectations enabled.

**Step 3: Verify outputs**

- Confirm JSON exists and contains metadata, summary counts, and normalized threads.
- Confirm comparison output identifies the screenshot thread or reports the mismatch precisely.

### Task 5: Reviewer Agents

**Files:**
- Review only

**Step 1: Dispatch three reviewer agents**

- API correctness reviewer
- Data completeness reviewer
- Page-match reviewer

**Step 2: Review and integrate**

- Read findings
- Apply any fixes
- Re-run verification commands
