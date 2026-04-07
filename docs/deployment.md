# Vercel Deployment

## Prerequisites

- A GitHub repository for this project
- A Vercel account
- A Cloudflare account with Turnstile enabled
- A Vercel Blob store created in the target project

## Environment Variables

Set these variables in Vercel Project Settings -> Environment Variables:

- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

For local development:

```bash
cp .env.example .env.local
```

## First Deployment

1. Push the repository to GitHub
2. In Vercel, choose `Add New Project`
3. Import the GitHub repository
4. Leave `Root Directory` empty. The repository root is the actual Next.js application root.
5. Set environment variables:
   - `BLOB_READ_WRITE_TOKEN`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
6. In Cloudflare Turnstile, create a widget and add every host you actually serve this app from, including your production domain and `localhost`
7. Deploy to the default `vercel.app` URL
8. Open the production deployment and verify the homepage renders in Chinese
9. Submit one real export request with:
   - a YouTube video URL
   - the end user's own YouTube Data API key
   - a completed Turnstile challenge
10. Confirm all three files are downloadable

## Optional Custom Domain

1. Open the target Vercel project
2. Go to `Domains`
3. Add your domain
4. If needed, set a redirect from the root domain to `www`
5. Wait for verification to complete
6. Re-run the export verification on the production domain

## Suggested Dashboard Flow

1. GitHub -> create or open the target repository
2. Vercel -> `Add New Project`
3. Import the repository
4. In `Settings -> Environment Variables`, add the three required variables
5. Trigger the first production deployment
6. In `Storage -> Blob`, verify the project has Blob enabled
7. In Cloudflare Turnstile, add your production domain
8. In `Domains`, add your production domain
9. Re-run one export from the production domain

## Verification Checklist

- `pnpm test`
- `pnpm build`
- Open the default `vercel.app` domain
- Verify the homepage renders in Chinese
- Verify the page asks for a user-provided YouTube API key
- Verify the Turnstile widget loads successfully
- Verify Turnstile is configured for the same hostname the request is sent from
- Submit one export request
- Confirm all three generated files can be downloaded
- Switch the production domain
- Re-run the same verification on `https://www.cybing.top`
