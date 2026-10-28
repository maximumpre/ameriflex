/**
 * Kit example SEO keywords — replace hosts/brand when cloning a project.
 * Google ignores meta keywords; Bing officially ignores them; **Yandex documents
 * that meta keywords can influence relevance** — so keep HOST_KEYWORDS in the
 * meta tag only. Keep natural; avoid stuffing.
 *
 * Wire into:
 * - `lib/seo-metadata.ts` → `SITE_KEYWORDS` (layout `<meta name="keywords">`)
 * - `lib/seo-metadata.ts` → `SITE_VISIBLE_KEYWORDS` (CrawlerSeoPage body)
 * - structured data → `alternateName` (top brand phrases)
 *
 * HOST split: domain tokens stay in `<meta name="keywords">` (Yandex) but are
 * NEVER printed in visible body text — a raw domain in "Related searches" is
 * low-value copy for users and crawlers alike.
 */

import { CANONICAL_HOST, SITE_DISPLAY_NAME } from "@/lib/site-url"

// Twin SERP H1 — brand-alone preferred for site-name consensus. Optional action
// suffix (e.g. `${SITE_DISPLAY_NAME} Login`) only when it does not hurt SERP
// brand / title-link / breadcrumb display. Twin uses this; human chrome uses
// WELCOME_TITLE / auth-copy — do not collapse the two.
export const PAGE_H1_HEADING = SITE_DISPLAY_NAME

/** Meta-keywords only (Yandex) — excluded from visible crawler body text. */
export const HOST_KEYWORDS = [
  CANONICAL_HOST,
  `www.${CANONICAL_HOST}`,
] as const

/**
 * Meta-only brand tokens: the industrial false-friend phrases (Ameriflex
 * vinyl) stay in <meta name="keywords"> for SERP defense but must never
 * appear in the crawler twin's visible body copy (wrong-brand association).
 */
export const META_ONLY_KEYWORDS = [
  "Ameriflex vinyl",
  "Ameriflex vinly",
] as const

export const BRAND_KEYWORDS = [
  SITE_DISPLAY_NAME,
  `${SITE_DISPLAY_NAME} login`,
  `${SITE_DISPLAY_NAME} log in`,
  `${SITE_DISPLAY_NAME} member login`,
  "MyAmeriflex",
  "MyAmeriflex login",
  `${SITE_DISPLAY_NAME} participant portal`,
  `${SITE_DISPLAY_NAME} card`,
  `${SITE_DISPLAY_NAME} FSA`,
  `${SITE_DISPLAY_NAME} HSA`,
  `${SITE_DISPLAY_NAME} COBRA login`,
  "myameriflex login",
  `${SITE_DISPLAY_NAME} benefits`,
  `${SITE_DISPLAY_NAME} portal`,
  `${SITE_DISPLAY_NAME} account access`,
] as const

export const RETIREMENT_GENERIC_KEYWORDS = [
  "Flexible Spending Account login",
  "FSA claims",
  "flex spending account",
  "health savings account login",
  "HSA login",
  "COBRA administration login",
  "commuter benefits login",
  "dependent care account",
  "employee benefits portal",
  "benefits participant portal",
  "submit reimbursement claims",
  "check FSA balance",
  "direct deposit reimbursement",
  "employee benefits administrator",
  "health reimbursement arrangement",
  "HRA account",
  "commuter reimbursement account",
  "vision care benefits",
  "mental health benefits",
  "tuition reimbursement",
  "limited purpose FSA",
  "excepted benefit HRA",
] as const

export const INTENT_KEYWORDS = [
  "forgot password",
  "forgot username",
  "secure login",
  "two step verification",
  "new user registration",
  "verification code",
  "two factor authentication",
  "passkey login",
  "secure sign in",
] as const

/** Cluster 4 — Workforce & participant roles. */
export const WORKFORCE_ROLE_KEYWORDS = [
  "participant portal",
  "member portal",
  "employee login",
  "employer portal login",
  "producer portal",
  "dependent coverage",
] as const

/** Cluster 5 — Platform & vendor synergy. */
export const PLATFORM_SYNERGY_KEYWORDS = [
  "benefits administration platform",
  "health benefits administrator",
  "payroll deducted benefits",
  "tax advantage accounts",
  "consumer driven benefits",
] as const

/** Cluster 6 — Self-service & mobile support. */
export const SELF_SERVICE_KEYWORDS = [
  "24/7 account access",
  "online claims submission",
  "e-statements",
  "card balance check",
  "reimbursement status",
  "text message verification",
  "password reset",
  "account recovery",
] as const

function mergeKeywords(...lists: readonly (readonly string[])[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const list of lists) {
    for (const keyword of list) {
      const key = keyword.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      result.push(keyword)
    }
  }
  return result
}

export function buildSiteKeywords(): string[] {
  return mergeKeywords(
    HOST_KEYWORDS,
    META_ONLY_KEYWORDS,
    BRAND_KEYWORDS,
    RETIREMENT_GENERIC_KEYWORDS,
    INTENT_KEYWORDS,
    WORKFORCE_ROLE_KEYWORDS,
    PLATFORM_SYNERGY_KEYWORDS,
    SELF_SERVICE_KEYWORDS,
  )
}

/** Meta keywords — includes HOST_KEYWORDS (Yandex relevance signal). */
export const SITE_KEYWORDS = buildSiteKeywords()

/**
 * Crawler-visible body keywords (`Related searches:`) — everything except
 * HOST_KEYWORDS. Domains belong in `<meta name="keywords">` only, never in
 * visible page copy.
 */
export function buildVisibleKeywords(): string[] {
  const metaOnly = new Set(
    [...HOST_KEYWORDS, ...META_ONLY_KEYWORDS].map((k) => k.toLowerCase()),
  )
  return SITE_KEYWORDS.filter((k) => !metaOnly.has(k.toLowerCase()))
}

export const SITE_VISIBLE_KEYWORDS = buildVisibleKeywords()
