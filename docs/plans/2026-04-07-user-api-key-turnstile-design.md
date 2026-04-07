# User API Key + Turnstile Design

## Goal

Make the export flow safe for public use by shifting YouTube API quota ownership to the end user and adding a managed anti-bot check before export starts.

## Product Decision

- The export form will require two user inputs:
  - YouTube video URL
  - User-provided YouTube Data API key
- The submit action will require a valid Cloudflare Turnstile token.
- The server will reject requests that do not include:
  - a non-empty API key
  - a non-empty Turnstile token
  - a successful Turnstile Siteverify result

## UX

The form stays single-screen and Chinese-first, but gains one new trust block:

- `YouTube 链接`
- `YouTube API Key`
- Turnstile widget
- `开始导出` button

Copy changes:

- Explain that the key is used only for the current export request.
- Explain that quota usage belongs to the user’s own Google Cloud project.
- Explain that Turnstile is used to reduce abuse.

Error handling:

- Missing URL: `请输入 YouTube 视频链接`
- Missing API key: `请输入 YouTube API Key`
- Missing Turnstile token: `请先完成人机验证`
- Failed Turnstile verification: `人机验证未通过，请重试`
- Existing export failures remain unchanged.

## Architecture

Client:

- Render Turnstile with `@marsidev/react-turnstile`
- Store the latest verification token in component state
- Send `{ url, apiKey, order, turnstileToken }` to `/api/export`
- Reset the widget after failures so the user can retry cleanly

Server:

- Add a `verifyTurnstileToken()` helper in `lib/turnstile.ts`
- Read `TURNSTILE_SECRET_KEY` from environment
- POST to `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- Validate `success`, and when available also validate `hostname`
- Only call export logic after verification succeeds

## Environment Variables

Add:

- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

Development defaults may use Cloudflare’s official test keys so local testing works without production secrets.

## Testing

- Update homepage and flow tests to require the API key field
- Add route-level tests for:
  - missing API key
  - missing Turnstile token
  - failed Turnstile verification
  - successful verification path
- Keep the exporter tests unchanged

## Notes

Cloudflare Turnstile requires server-side verification to be complete, and Cloudflare recommends `@marsidev/react-turnstile` for React rendering. This design follows that model directly.
