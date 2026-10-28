import { NextResponse } from "next/server"

/**
 * Legacy `/login` entry — the indexed login lives at `/` (Astro landing).
 * 308 permanent redirect to the root path (path-level legacy only; the
 * www/apex primary-host redirect belongs to Vercel Domains, never middleware).
 */
export function GET(request: Request) {
  const url = new URL("/", request.url)
  return NextResponse.redirect(url, 308)
}
