# Swallern External Services — Recommended Setup

The important idea: an API key is simply a private password that lets Swallern's server talk to another service.

## Connect now

### 1. OpenAI API — REQUIRED
Purpose:
- research assistance
- topic classification
- explanations
- quizzes
- lessons
- related topics
- later scripts and content automation

Create a project/API key in the OpenAI API platform. OpenAI's current documentation says API keys should be kept secret and loaded server-side through environment variables, never exposed in browser code. Use a server-side key such as `OPENAI_API_KEY`. 

For Swallern MVP, start with a cost-conscious model for high-volume routine work and reserve stronger reasoning models for difficult research/review tasks. The exact model can be configured after initial benchmarking.

IMPORTANT: Never paste an OpenAI secret key into chat, GitHub, screenshots, or frontend code.

### 2. YouTube Data API — REQUIRED
Purpose:
- discover relevant educational videos
- retrieve video/channel metadata
- later support Swallern's YouTube publishing workflow

Google's official documentation says the YouTube Data API requires a Google Cloud project, API enablement, and credentials. Public-data reads can use an API key; actions on an authenticated YouTube account require OAuth 2.0.

Create:
- Google Cloud project: Swallern
- Enable YouTube Data API v3
- API key for public discovery
- OAuth credentials later, when we automate publishing to Swallern's own YouTube channel

Environment variable:
`YOUTUBE_API_KEY`

### 3. Resend — RECOMMENDED
Purpose:
- verification emails
- password/reset emails if we use email auth
- future newsletters

Create and verify:
`swallern.com`

Environment variable:
`RESEND_API_KEY`

Use a restricted/sending-only key for production email when possible.

### 4. Sentry — RECOMMENDED
Purpose:
- production error monitoring
- performance/debugging
- alerts when something breaks

Environment variable:
`SENTRY_DSN`

This is not required for the first local prototype but should be enabled before public launch.

## Connect later

### Google Search Console
Use after `swallern.com` is live to monitor indexing/search performance and submit the sitemap.

### Video generation
Do NOT connect a video-generation provider yet. We should first prove the topic/content loop. Later we can select a provider based on cost, quality, licensing, API stability, and commercial usage rights.

### Social publishing
Do NOT connect every social platform now. Start with YouTube after the content pipeline is proven. Add other networks later.

### Trend ingestion
Do not make an unofficial Google Trends scraper a hard dependency. Start with a replaceable trend-source interface so the backend can accept multiple signals. This keeps the architecture resilient.

## Environment-variable pattern

Local `.env.local` / deployment secret store:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_URL=
SUPABASE_SECRET_KEY=

OPENAI_API_KEY=
YOUTUBE_API_KEY=
RESEND_API_KEY=
SENTRY_DSN=
```

Never commit `.env.local` or secret values to GitHub.

Supabase currently recommends publishable keys for browser/client use and secret keys for backend/server use; secret keys bypass Row Level Security and must remain server-side. Supabase is moving away from the legacy `anon` and `service_role` names during 2026.

## What you need to do

You do NOT need to understand the programming details.

Just create the service accounts/projects above and keep the credentials in a password manager or the deployment platform's secret settings. We will wire them into the application during Phase 7.

Never send the secret values to me in chat.
