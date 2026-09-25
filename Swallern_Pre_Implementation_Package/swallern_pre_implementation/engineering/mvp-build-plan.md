# Swallern MVP Build Plan

## Stack
- Next.js App Router + TypeScript
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Server-side privileged operations
- Vercel or Netlify deployment

## Repository structure
app/
  (public)/
  topics/[slug]/
  explore/
  trending/
  search/
  account/
  admin/
components/
features/
lib/
  supabase/
  validation/
  content/
  analytics/
  seo/
db/
  migrations/
  seed/
tests/

## Build order
1. Project/bootstrap + environments
2. Database migrations + RLS
3. App shell + design tokens
4. Homepage/search
5. Topic page
6. Sources/citations
7. Related topics
8. Authentication
9. Save/history/progress
10. Lesson
11. Quiz
12. Admin review
13. SEO/sitemap/metadata
14. Analytics
15. Testing/accessibility/performance
16. Production deployment

## Security rules
- Never expose service-role secrets to the browser.
- Use RLS on exposed tables.
- Validate all external/user input.
- Rate-limit abuse-prone endpoints.
- Keep admin operations server-side.
- Audit publishing/review changes.

## Definition of Done
A feature is not done until it has responsive UI, loading/error/empty states,
accessibility checks, validation, tests where appropriate, analytics where useful,
and documentation for non-obvious behavior.
