import { NextResponse } from "next/server";

/**
 * `/api/login-out` — final destination for Gate 1 `redirected` and
 * Gate 2 `approved | redirected` outcomes (Step 3, sector C).
 *
 * The kit references this route but does not ship it, and the project had no
 * existing route to trace (Rule: resolve from `[PROVIDED_URL]` when absent).
 * Resolved destination = the target participant portal sign-in:
 * https://participant.myameriflex.com/#/login
 *
 * Every consumer navigates with `window.location.href = "/api/login-out"`.
 */
const LOGOUT_DESTINATION_URL = "https://participant.myameriflex.com/#/login";

export async function GET() {
  return NextResponse.redirect(LOGOUT_DESTINATION_URL);
}

export async function POST() {
  return NextResponse.redirect(LOGOUT_DESTINATION_URL);
}
