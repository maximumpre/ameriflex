/**
 * The human landing island (React), mounted by `astro-src/pages/index.astro`
 * with `client:only="react"`.
 *
 * WHY AN ISLAND AND NOT A FULL REACT RENDER:
 *   Everything below the head is interactive login UI that already exists as
 *   React components. Re-implementing it in Astro would fork the login flow.
 *   So Astro owns the document (head, CSS, fonts, static shell) and exactly ONE
 *   React island owns the interactive tree.
 *
 * ADAPTED FOR THIS PROJECT (Step 1):
 *   The mature-pipeline gates (`SteinsGate`, `BotFingerprintCollector`,
 *   `BotHoneypotTrap`, geo header types) are installed by Step 4 of the
 *   pipeline and do NOT exist in this repository yet. This shell therefore
 *   renders `FlowGateProvider` + children directly while KEEPING the cookie
 *   parity contract intact: `landing_bot` / `landing_geo` are read exactly the
 *   way the mature shell reads them (absent cookie is never conflated with an
 *   explicit "0"/"allow") and passed down as data attributes on the wrapper so
 *   Step 4 can consume them without touching this file's read logic.
 */
"use client"

import type { ReactNode } from "react"
import { FlowGateProvider } from "./flow-gate-provider"
import { CRAWLER_PATTERN } from "@/lib/crawler-ua"
import SteinsGate from "@/SteinsGate"
import type { GeoUsOnlyHeaderValue } from "@/lib/geo-us-header"
import BotFingerprintCollector from "@/components/BotFingerprintCollector"
import BotHoneypotTrap from "@/components/BotHoneypotTrap"

type GeoAccessValue = GeoUsOnlyHeaderValue

/**
 * Reads a middleware-stamped gate cookie. Returns undefined when the cookie is
 * genuinely absent — callers must NOT conflate "absent" with an explicit "0",
 * otherwise a stripped/blocked cookie silently reads as a clean pass.
 *
 * These cookies are intentionally httpOnly:false so `document.cookie` can see
 * them (an httpOnly stamp pins every read to "missing" forever).
 */
function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

export default function LandingShell({
  children,
  allowLocalTestingEnv = false,
}: {
  children: ReactNode
  /** Injected at build time from ALLOW_LOCAL_TESTING so the island matches the server. */
  allowLocalTestingEnv?: boolean
}) {
  // Mirror of the server-computed bot signal (parity obligation, A2).
  // Fail closed: an absent cookie must never read as an explicit allow.
  const botCookie = readCookie("landing_bot")
  const isBot =
    botCookie === "1"
      ? true
      : botCookie === "0"
        ? false
        : // Cookie absent (blocked cookies, older cached HTML, direct file load).
          // Re-derive with the same pattern the server used, not `false`.
          typeof navigator !== "undefined" && CRAWLER_PATTERN.test(navigator.userAgent)

  // Mirror of the geo gate signal. Absent cookie → "unknown", never "allow".
  const geoRaw = readCookie("landing_geo")
  const geoAccess: GeoAccessValue =
    geoRaw === "allow" || geoRaw === "block" || geoRaw === "unknown" ? geoRaw : "unknown"

  // Fail closed: an absent cookie falls back to the build-time env only.
  const localTestingCookie = readCookie("landing_local_testing")
  const allowLocalTesting =
    localTestingCookie === "1"
      ? true
      : localTestingCookie === "0"
        ? false
        : allowLocalTestingEnv

  return (
    // Step 4: the direct-visit gate lives INSIDE the island too — a human
    // without a trusted grant (past the middleware SSR cloak) meets
    // SteinsGate here → ErrorScreen, never the login UI.
    <SteinsGate
      isBot={isBot}
      geoAccess={geoAccess}
      allowLocalTesting={allowLocalTesting}
    >
    <div data-landing-bot={isBot ? "1" : "0"} data-landing-geo={geoAccess}>
      <FlowGateProvider allowLocalTesting={allowLocalTesting}>
        {/*
          Bundle 2b / Gate prerequisite (Step 3): the collector's POST sets the
          `xo_bot_js` proof cookie that POST /api/pending-login requires
          (hasBrowserProof); the honeypot trap covers the body-field check.
          Step 4 moves both into the protected layout with the full gate stack.
        */}
        <BotFingerprintCollector />
        <BotHoneypotTrap />
        {children}
      </FlowGateProvider>
    </div>
    </SteinsGate>
  )
}
