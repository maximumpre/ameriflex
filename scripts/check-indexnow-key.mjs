#!/usr/bin/env node
/**
 * check-indexnow-key.mjs — OFFLINE IndexNow audit (Step 6, Sector B/C/E).
 * Verifies: INDEXNOW_KEY default exists in lib/site-url.ts as a 32-hex literal
 * with the env-override pattern; public/{key}.txt exists with EXACT contents
 * (single line, no BOM/whitespace/newline); no stale key .txt files; and
 * package.json wires `"postbuild": "node scripts/notify-indexnow.mjs"`.
 * Never pings IndexNow (Rule 1C). Exit 1 on any failure.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs"
import { join } from "node:path"

const root = process.cwd()
const failures = []

const siteUrlPath = existsSync(join(root, "src/lib/site-url.ts"))
  ? join(root, "src/lib/site-url.ts")
  : join(root, "lib/site-url.ts")

let key = null

if (!existsSync(siteUrlPath)) {
  failures.push("lib/site-url.ts missing")
} else {
  const t = readFileSync(siteUrlPath, "utf8")
  const m = t.match(
    /export const INDEXNOW_KEY\s*=\s*\n?\s*process\.env\.INDEXNOW_KEY\?\.trim\(\)\s*\?\?\s*"([^"]+)"/,
  )
  if (!m) {
    failures.push(
      'INDEXNOW_KEY must be `process.env.INDEXNOW_KEY?.trim() ?? "<key>"` in lib/site-url.ts',
    )
  } else {
    key = m[1]
    if (!/^[0-9a-f]{32}$/i.test(key)) {
      failures.push(`INDEXNOW_KEY default must be a 32-hex string (got "${key}")`)
    }
    if (/your-indexnow-key|example/i.test(key)) {
      failures.push(`INDEXNOW_KEY still a placeholder: ${key}`)
    }
  }
}

if (key) {
  const keyFile = join(root, "public", `${key}.txt`)
  if (!existsSync(keyFile)) {
    failures.push(`public/${key}.txt missing (one line = key only)`)
  } else {
    const raw = readFileSync(keyFile)
    const text = raw.toString("utf8")
    if (text !== key) {
      failures.push(
        `public/${key}.txt must equal the key EXACTLY with no trailing newline/whitespace/BOM (got ${raw.length} bytes, expected ${key.length})`,
      )
    }
  }

  // Stale IndexNow key files (Rule 6): any other pure-32-hex .txt in public/.
  const txts = readdirSync(join(root, "public")).filter((f) => f.endsWith(".txt"))
  for (const f of txts) {
    if (f === "robots.txt") continue
    if (/^[0-9a-f]{32}\.txt$/i.test(f) && f.toLowerCase() !== `${key.toLowerCase()}.txt`) {
      failures.push(`stale IndexNow key file in public/: ${f}`)
    }
  }

  // Key file must be reachable WITHOUT ErrorScreen gating (ungated 32-hex path).
  const spp = join(root, "lib/seo-public-paths.ts")
  if (existsSync(spp)) {
    const t = readFileSync(spp, "utf8")
    if (!/32\}\\?\.txt|0-9a-f\]\{32\}\\.txt/i.test(t)) {
      failures.push("lib/seo-public-paths.ts must ungated-match /{32-hex}.txt (IndexNow key)")
    }
  }
}

// Postbuild wiring (Sector C).
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
if (!pkg.scripts?.postbuild || !/notify-indexnow\.mjs/.test(pkg.scripts.postbuild)) {
  failures.push('package.json missing `"postbuild": "node scripts/notify-indexnow.mjs"`')
}
if (!existsSync(join(root, "scripts/notify-indexnow.mjs"))) {
  failures.push("scripts/notify-indexnow.mjs missing")
}
if (!existsSync(join(root, "scripts/seo-telegram-notify.mjs"))) {
  failures.push("scripts/seo-telegram-notify.mjs missing")
}

if (failures.length) {
  console.error("FAIL check-indexnow-key")
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
console.log(`OK check-indexnow-key (offline) — key ${key}, file verified, postbuild wired`)
process.exit(0)
