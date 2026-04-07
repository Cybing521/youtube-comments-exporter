# Environment Variables

## Required

### `YOUTUBE_API_KEY`

Google YouTube Data API key used by the server-side export flow.
This key should be configured in Vercel or in local `.env.local`, not exposed in the public UI.

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

## Production Notes

- Public users should only paste a YouTube video URL.
- The frontend should not ask end users to provide their own API key.
- Missing `YOUTUBE_API_KEY` will cause `/api/export` to return an error.
