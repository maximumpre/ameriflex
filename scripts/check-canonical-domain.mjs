#!/usr/bin/env node
/**
 * check-canonical-domain.mjs — OFFLINE canonical-origin audit (Step 6, Sector E).
 * Verifies lib/site-url.ts carries the operator-pasted production origin as a
 * literal (never an env fallback), that the canonical helpers derive from it,
 * that no middleware www/apex redirect exists, and that the canonical consumers
 * (layout metadataBase, sitemap, robots.txt Sitemap line) point at it.
 * Never performs live network checks (Rule 1B). Exit 1 on any failure.
 */
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const failures = []

const siteUrlPath = existsSync(join(root, "src/lib/site-url.ts"))
  ? join(root, "src/lib/site-url.ts")
  : join(root, "lib/site-url.ts")

if (!existsSync(siteUrlPath)) {
  failures.push("lib/site-url.ts missing")
} else {
  const t = readFileSync(siteUrlPath, "utf8")

  // SITE_ORIGIN must be a pasted literal, not an env-derived value (Rule 1).
  const originMatch = t.match(/export const SITE_ORIGIN\s*=\s*"([^"]+)"/)
  if (!originMatch) {
    failures.push(
      'SITE_ORIGIN must be a hardcoded literal export (`export const SITE_ORIGIN = "https://…"`), not an env fallback or template',
    )
  } else {
    const origin = originMatch[1]
    if (!/^https:\/\//.test(origin)) failures.push(`SITE_ORIGIN must be https: ${origin}`)
    if (/\/$/.test(origin)) failures.push(`SITE_ORIGIN must have no trailing slash: ${origin}`)
    if (/example\.com|localhost|your-|127\.0\.0\.1/i.test(origin)) {
      failures.push(`SITE_ORIGIN still a placeholder: ${origin}`)
    }
    // www lock (Bing empty-index guard): apex-primary is allowed ONLY with the
    // documented SITE_ORIGIN_ALLOW_APEX=1 escape hatch (operator paste 2026-10-28).
    try {
      const apexHost = new URL(origin).hostname
      if (!apexHost.startsWith("www.")) {
        if (process.env.SITE_ORIGIN_ALLOW_APEX !== "1") {
          failures.push(
            `SITE_ORIGIN hostname must start with www. (got ${apexHost}). Paste the Vercel Domains Primary Host (HTTP 200), usually https://www.<domain>. If apex is intentionally primary, set SITE_ORIGIN_ALLOW_APEX=1 for this build.`,
          )
        } else {
          console.log("apex-primary documented — SITE_ORIGIN_ALLOW_APEX=1 honored")
        }
      }
    } catch {
      failures.push(`SITE_ORIGIN is not a valid URL: ${origin}`)
    }

    try {
      const u = new URL(origin)
      if (u.pathname !== "" && u.pathname !== "/") failures.push(`SITE_ORIGIN must be origin-only (no path): ${origin}`)
    } catch {
      failures.push(`SITE_ORIGIN is not a valid URL: ${origin}`)
    }

    // Derivation helpers must exist and point at SITE_ORIGIN.
    if (!/export const SITE_URL\s*=\s*SITE_ORIGIN/.test(t)) {
      failures.push("SITE_URL must be `= SITE_ORIGIN`")
    }
    if (!/export const SITE_HOMEPAGE_CANONICAL\s*=\s*`\$\{SITE_ORIGIN\}\/`/.test(t)) {
      failures.push("SITE_HOMEPAGE_CANONICAL must be `${SITE_ORIGIN}/`")
    }
    if (!/export const CANONICAL_HOST\s*=\s*new URL\(SITE_ORIGIN\)\.hostname/.test(t)) {
      failures.push("CANONICAL_HOST must derive from new URL(SITE_ORIGIN).hostname")
    }
    if (!/export const SITE_SITEMAP_URL\s*=\s*`\$\{SITE_ORIGIN\}\/sitemap\.xml`/.test(t)) {
      failures.push("SITE_SITEMAP_URL must be `${SITE_ORIGIN}/sitemap.xml`")
    }

    // Consumer spot-checks (static, offline).
    const layoutPath = join(root, "app/layout.tsx")
    if (existsSync(layoutPath)) {
      const lt = readFileSync(layoutPath, "utf8")
      if (!/metadataBase:\s*new URL\(SITE_ORIGIN\)/.test(lt)) {
        failures.push("app/layout.tsx metadataBase must be `new URL(SITE_ORIGIN)`")
      }
      if (/NEXT_PUBLIC_BASE_URL/.test(lt)) {
        failures.push("app/layout.tsx must not derive origin from NEXT_PUBLIC_BASE_URL (paste is canonical)")
      }
      if (/participant\.ameriflex\.com|www\.example\.com/.test(lt)) {
        failures.push("app/layout.tsx contains a stale/placeholder domain literal")
      }
    }

    const sitemapPath = join(root, "app/sitemap.ts")
    if (existsSync(sitemapPath)) {
      const st = readFileSync(sitemapPath, "utf8")
      if (!/SITE_ORIGIN|SITE_HOMEPAGE_CANONICAL/.test(st)) failures.push("app/sitemap.ts must derive entries from SITE_ORIGIN / SITE_HOMEPAGE_CANONICAL")
      if (/participant\.ameriflex\.com/.test(st)) failures.push("app/sitemap.ts has a stale domain literal")
    }

    const robotsPath = join(root, "public/robots.txt")
    if (existsSync(robotsPath)) {
      const rt = readFileSync(robotsPath, "utf8")
      const expected = `Sitemap: ${origin}/sitemap.xml`
      if (!rt.includes(expected)) {
        failures.push(`public/robots.txt Sitemap line must be \`${expected}\``)
      }
    }

    // No middleware www/apex redirect (Rule 2).
    const mwPath = join(root, "middleware.ts")
    if (existsSync(mwPath)) {
      const mt = readFileSync(mwPath, "utf8")
      if (/handlePreferredHostRedirect/.test(mt)) {
        failures.push("middleware still contains handlePreferredHostRedirect (Vercel Domains owns the edge redirect)")
      }
      if (/www\..*redirect|redirect.*www\./i.test(mt) && /NextResponse\.redirect/.test(mt)) {
        failures.push("middleware appears to contain a www/apex host redirect (Rule 2)")
      }
    }
  }
}

if (failures.length) {
  console.error("FAIL check-canonical-domain")
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log("OK check-canonical-domain (offline)")
process.exit(0)
