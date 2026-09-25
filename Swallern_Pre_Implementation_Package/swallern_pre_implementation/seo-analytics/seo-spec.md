# Swallern SEO Specification v1

## URL model
- /topics/{slug}
- /explore
- /trending
- /categories/{slug}
- /search?q={query}
- /learn/{topic-slug} (only if separate indexing is useful; otherwise canonicalize to topic)

## Topic metadata
Every indexable topic should have:
- unique title
- useful meta description
- canonical URL
- Open Graph title/description/image
- structured data where appropriate
- breadcrumb data
- internal links to related topics

## Indexing rules
Index substantial, useful topic pages.
Do not index thin, duplicate, empty, draft, rejected, or low-quality pages.
Sitemaps should contain canonical, published URLs only.

## Internal linking
Every topic should link to:
- category
- relevant related topics
- sources
- optional lesson/quiz
The related-topic graph should be meaningful rather than keyword stuffing.

## Content freshness
Store published version and last-reviewed timestamp.
Time-sensitive topics require explicit review/update rules.
