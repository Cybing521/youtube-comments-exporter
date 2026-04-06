# Environment Variables

## Required

### `YOUTUBE_API_KEY`

Google YouTube Data API key used for comment export requests.

### `BLOB_READ_WRITE_TOKEN`

Vercel Blob read-write token for uploading generated JSON and Excel files.

## Local Setup

```bash
cp .env.example .env.local
```

Then fill in the values manually or run:

```bash
vercel env pull
```

if the project is already connected to Vercel.
