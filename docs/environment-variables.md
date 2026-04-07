# Environment Variables

## Required

### `BLOB_READ_WRITE_TOKEN`

Vercel Blob read-write token for uploading generated JSON and Excel files.

### `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Cloudflare Turnstile site key used by the browser widget.

### `TURNSTILE_SECRET_KEY`

Cloudflare Turnstile secret key used by the server-side Siteverify request.

## Optional

### `YOUTUBE_API_KEY`

Only needed if you still run the legacy Python prototype under `src/`.
The public Web export flow no longer reads this variable.

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

- Public users must provide their own YouTube Data API key before export.
- The frontend should show a Turnstile widget and the server should verify it before calling YouTube.
- The server also compares the verified Turnstile `hostname` with the current request host.
- Missing `TURNSTILE_SECRET_KEY` will cause `/api/export` to return an error.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` must be available in both local development and Vercel production.
