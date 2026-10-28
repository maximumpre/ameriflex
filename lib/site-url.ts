/**
 * Production site-url — Step 6 (Domain Origin & IndexNow).
 *
 * `SITE_ORIGIN` is the operator-pasted production domain, EXACTLY as pasted
 * (https://myamerlflex.com — confirmed literal by the operator on 2026-10-28).
 * It feeds BOTH heads: the Next `metadata` export (app/layout.tsx) and the
 * Astro pages (astro-src/components/seo-head.astro → canonical, og:url,
 * og:image, Twitter image). Change it here only — both heads must pick it up
 * (can't-drift); a canonical that updates on one side is an SEO regression.
 *
 * RULE 1: must equal the Vercel Domains Primary Host (HTTP 200 host). If the
 * operator's Vercel primary ever becomes `www.` (apex 308), re-paste the www
 * origin here — never redirect www/apex in middleware (Rule 2).
 *
 * `ALLOWED_BACKLINK_HOSTS` intentionally lives in `lib/project-config.ts`
 * (its single consumer is `lib/allowed-referrer.ts`) — not duplicated here.
 */

export const SITE_DISPLAY_NAME = "Ameriflex" as const

export const SITE_ORIGIN = "https://myamerlflex.com" as const

export const SITE_URL = SITE_ORIGIN

export const SITE_HOMEPAGE_CANONICAL = `${SITE_ORIGIN}/` as const

export const SITE_SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml` as const

export const CANONICAL_HOST = new URL(SITE_ORIGIN).hostname

export const SITE_CONTENT_UPDATED_AT = "2026-10-28T00:00:00.000Z" as const

/** IndexNow key (operator paste). Env override wins at deploy time. */
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY?.trim() ?? "fca4c1881e864f8fbbfc56b56c98b6d8"

export function canonicalUrlForPath(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  if (path === "/") return SITE_HOMEPAGE_CANONICAL
  return `${SITE_ORIGIN}${path}`
}

/** Display name for the ops Telegram visitor alert (kit contract). */
export function getTelegramVisitorSiteName(): string {
  return SITE_DISPLAY_NAME.trim()
}
