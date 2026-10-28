/**
 * Robots directives for indexable pages. Mirrors the `metadata.robots`
 * export in `app/layout.tsx` (index/follow + googlebot max-* values).
 */

export const INDEXABLE_PAGE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-video-preview": -1 as const,
    "max-image-preview": "large" as const,
    "max-snippet": -1 as const,
  },
} as const
