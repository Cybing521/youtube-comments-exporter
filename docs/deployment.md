# Vercel Deployment

## Prerequisites

- A GitHub repository for this project
- A Vercel account with access to `cybing.top`
- A YouTube Data API key
- A Vercel Blob store created in the target project

## First Deployment

1. Push the repository to GitHub
2. In Vercel, choose `Add New Project`
3. Import the GitHub repository
4. Set environment variables:
   - `YOUTUBE_API_KEY`
   - `BLOB_READ_WRITE_TOKEN`
5. Deploy to the default `vercel.app` URL

## Switch `cybing.top` to the New Project

1. Open the old Vercel project
2. Go to `Domains`
3. Remove `www.cybing.top`
4. Remove `cybing.top`
5. Open the new project
6. Add `www.cybing.top` as the production domain
7. Add `cybing.top` and configure it to redirect to `www.cybing.top`
8. Wait for verification to complete

## Verification Checklist

- `pnpm test`
- `pnpm build`
- Open `https://www.cybing.top`
- Verify the homepage renders in Chinese
- Submit one export request
- Confirm all three generated files can be downloaded
