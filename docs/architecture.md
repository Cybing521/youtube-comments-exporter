# Architecture

## Overview

The project is split into two main layers:

- `app`: the user-facing Next.js application and API routes
- `components`: page-level and form components
- `lib/export-core`: reusable TypeScript logic for YouTube comment export and file generation

## Request Flow

1. User submits a YouTube URL from the homepage
2. `POST /api/export` validates the request
3. `runExportAndUpload()` extracts the video ID and uses the export core
4. The export core fetches top-level comment threads and backfills missing replies
5. The artifact builder generates JSON, threaded Excel, and flat Excel
6. Blob upload returns downloadable URLs
7. The API response returns summary counts and file URLs

## Current Constraints

- Export is currently done in a single server request
- Retry and timeout policies are not implemented yet
- This is suitable for an MVP and single-video exports, but not yet for long-running batch jobs
