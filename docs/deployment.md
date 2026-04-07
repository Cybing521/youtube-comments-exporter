# Vercel Deployment

## Prerequisites

- A GitHub repository for this project
- A Vercel account
- A YouTube Data API key
- A Vercel Blob store created in the target project

## Environment Variables

Set these variables in Vercel Project Settings -> Environment Variables:

- `YOUTUBE_API_KEY`
- `BLOB_READ_WRITE_TOKEN`

For local development:

```bash
cp apps/web/.env.example apps/web/.env.local
```

## First Deployment

1. Push the repository to GitHub
2. In Vercel, choose `Add New Project`
3. Import the GitHub repository
4. Set the `Root Directory` to `apps/web`. This repository is a monorepo, but the actual Next.js application root is `apps/web`.
5. Set environment variables:
   - `YOUTUBE_API_KEY`
   - `BLOB_READ_WRITE_TOKEN`
6. Deploy to the default `vercel.app` URL
7. Open the production deployment and verify the homepage renders in Chinese
8. Submit one real export request and confirm all three files are downloadable

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
4. In `Settings -> Environment Variables`, add the two required variables
5. Trigger the first production deployment
6. In `Storage -> Blob`, verify the project has Blob enabled
7. In `Domains`, add your production domain
8. Re-run one export from the production domain

## Verification Checklist

- `pnpm test`
- `pnpm build`
- Open the default `vercel.app` domain
- Verify the homepage renders in Chinese
- Submit one export request
- Confirm all three generated files can be downloaded
- Switch the production domain
- Re-run the same verification on `https://www.cybing.top`
