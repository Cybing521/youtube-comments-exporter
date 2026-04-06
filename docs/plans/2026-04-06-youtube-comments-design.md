# YouTube Comments Export Design

**Goal:** Export a video's top-level comments plus all available replies from the official YouTube Data API into a normalized JSON file, then compare a known on-page thread against the exported data.

**Context:** The workspace is empty and is not a git repository. We will create a minimal Python project that depends only on the standard library so it can run immediately with an environment variable API key.

## Scope

- Fetch all top-level comment threads for one video through `commentThreads.list`.
- For any thread whose `totalReplyCount` exceeds the embedded replies returned in the thread payload, fetch the missing replies through `comments.list(parentId=...)`.
- Normalize output fields to the user's requested shape:
  - top-level: username, published time, text, like count, reply count
  - replies: username, published time, text, like count
- Save one full JSON export per run.
- Produce a simple comparison report for a thread visible in the provided screenshot.

## Non-Goals

- Browser automation
- Cookie-based scraping
- Multi-video batch workflows
- Database storage

## Data Flow

1. Parse the input URL to a `videoId`.
2. Page through `commentThreads.list(part=snippet,replies,maxResults=100,order=relevance)`.
3. For each thread:
   - extract normalized top-level fields
   - collect any embedded replies
   - if `replyCount > embeddedReplies`, page through `comments.list(part=snippet,parentId=thread_id,maxResults=100)` to complete replies
4. Build one JSON document with metadata, summary counts, and normalized threads.
5. Search the exported data for the screenshot thread and record whether the author/text/replies align.

## Validation

- Unit tests cover pagination, reply backfill, and normalization.
- A real run against `gtEROmL0NzQ` generates a JSON export.
- A comparison step checks whether the exported JSON contains the visible screenshot thread from `@chinahamyku6583` and the shown replies.

## Risks

- API quota limits for very large videos
- Some page-visible text can differ slightly between the site and API `textDisplay`
- The API may not expose every moderation-state artifact visible to privileged viewers
