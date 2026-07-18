"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export default function PrivacyPolicyPage() {
  // All accordions closed initially as requested
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const sections: AccordionItem[] = [
    {
      id: "security",
      title: "Security",
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-[16px]">
          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">1. Our Commitment to Participant Data Protection</h3>
            <p>
              At Ameriflex, protecting the confidentiality, integrity, and availability of your personal, financial, and healthcare information is our highest priority. Our participant portal located at <strong>participant.ameriflex.com</strong> utilizes enterprise-grade security architectures designed to defend against unauthorized access, data breaches, and cyber threats. We continually invest in advanced cybersecurity systems to ensure your benefits account data remains strictly protected.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">2. Multi-Factor Authentication (MFA) & Encryption Standards</h3>
            <p className="mb-2">
              All communications between your browser and the MyAmeriflex portal are protected using Transport Layer Security (TLS 1.3) with 256-bit AES encryption. This ensures that sensitive login credentials, claims receipts, and account balances are completely unreadable to unauthorized third parties during transmission.
            </p>
            <p>
              Furthermore, we mandate robust Multi-Factor Authentication (MFA) for participant sign-in sessions. When accessing your Flexible Spending Account (FSA), Health Savings Account (HSA), or commuter benefits, our multi-layered identity verification protocols challenge unrecognized devices or suspicious login attempts to prevent credential stuffing and unauthorized account takeover.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">3. SOC 2 Conformance & Continuous Monitoring</h3>
            <p>
              Ameriflex infrastructure undergoes rigorous annual third-party compliance assessments, including Service Organization Control (SOC 2 Type II) audits. Our security operations team conducts continuous vulnerability scanning, intrusion detection monitoring, and independent third-party penetration testing across all web applications and database tiers.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">4. Automatic Session Timeout & Participant Best Practices</h3>
            <p>
              To protect your account if a computer or mobile device is left unattended, participant sessions on participant.ameriflex.com automatically terminate after a period of inactivity. We strongly recommend that participants:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
              <li>Use a unique, complex password consisting of numbers, symbols, and mixed-case letters.</li>
              <li>Never share your MyAmeriflex portal credentials or verification codes with any third party.</li>
              <li>Always verify that the browser address bar reads precisely <strong>https://participant.ameriflex.com</strong> before entering your password.</li>
              <li>Immediately notify Ameriflex Member Services if you suspect any unauthorized activity on your benefits account or debit card.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "privacy-policy",
      title: "Privacy Policy",
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-[16px]">
          <div className="border-l-4 border-[#163e48] pl-4 py-1 mb-6 text-sm text-slate-800 font-medium">
            Effective Date: January 1, 2026 | Last Reviewed: July 2026<br />
            This Privacy Policy applies to the official Ameriflex participant portal (participant.ameriflex.com) and all employee benefit administration services provided by Ameriflex.
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">1. Information We Collect</h3>
            <p>
              When you enroll in or administer an Ameriflex Flexible Spending Account (FSA), Health Savings Account (HSA), Health Reimbursement Arrangement (HRA), COBRA, or Commuter Benefit plan, we collect both personal and benefit-related data required to service your account:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
              <li><strong>Personal Identifiers:</strong> Legal name, Social Security Number (SSN) or Tax ID, residential address, email address, date of birth, and telephone numbers.</li>
              <li><strong>Financial Information:</strong> Bank account routing and account numbers used for direct deposit reimbursements, Ameriflex debit card transaction history, and account balances.</li>
              <li><strong>Protected Health Information (PHI):</strong> Medical expense documentation, provider statements, itemized pharmacy receipts, and diagnostic codes submitted by you or your healthcare providers during the claims substantiation process.</li>
              <li><strong>Technical Portal Data:</strong> Internet Protocol (IP) addresses, browser type, device identifiers, and portal navigation metrics collected via secure cookies and system logs to verify authentication and maintain session security.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">2. How We Use Your Information</h3>
            <p>
              Ameriflex uses the collected information strictly for the legitimate administration of your employee benefit plans, including:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
              <li>Adjudicating, processing, and disbursing reimbursement claims for qualified medical and dependent care expenses.</li>
              <li>Issuing, managing, and substantiating debit card transactions made on your Ameriflex Mastercard® or Visa® benefit card.</li>
              <li>Communicating critical account notifications, balance alerts, password resets, and annual IRS tax documentation.</li>
              <li>Complying with Internal Revenue Service (IRS), Department of Labor (DOL), and state regulatory substantiation requirements.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">3. HIPAA & GLBA Regulatory Compliance</h3>
            <p>
              As a Business Associate under the Health Insurance Portability and Accountability Act (HIPAA) and a financial service administrator under the Gramm-Leach-Bliley Act (GLBA), Ameriflex adheres to federal administrative, physical, and technical privacy safeguards. We treat all medical documentation submitted to support FSA or HRA claims as confidential Protected Health Information (PHI). We do not disclose PHI for marketing purposes or any purpose unrelated to plan administration without your explicit written authorization.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">4. Information Sharing and Disclosure</h3>
            <p className="mb-2">
              <strong>We do not sell, rent, or trade your personal or financial information to commercial third parties.</strong> We only disclose participant information under the following limited, essential circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600">
              <li><strong>With Your Plan Sponsor (Employer):</strong> We provide aggregated or necessary administrative reports to your employer (or their designated benefits broker) to verify enrollment eligibility, contribution deductions, and compliance audits, exactly as permitted under HIPAA group health plan exemptions.</li>
              <li><strong>With Trusted Service Partners:</strong> We engage accredited financial institutions, debit card processing networks, and secure printing facilities solely to execute core portal functions (e.g., printing replacement benefit cards or processing ACH deposits). All partners are bound by strict Business Associate Agreements (BAAs) and confidentiality covenants.</li>
              <li><strong>Required by Law:</strong> We may disclose records when compelled by valid judicial subpoenas, court orders, or federal regulatory inquiries (such as IRS audits).</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">5. Cookies and Portal Analytics</h3>
            <p>
              The MyAmeriflex portal utilizes essential session cookies to maintain your login credentials as you navigate across secure account pages. We do not use third-party behavioral advertising cookies across our authenticated participant pages. You may configure your browser to reject cookies; however, doing so will prevent you from successfully logging in to manage your benefits.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">6. Participant Rights & Retention</h3>
            <p>
              Depending on your state of residence and applicable federal benefit laws, you have the right to request an accounting of disclosures, inspect your claims records, and submit corrections to inaccurate personal details within the portal profile settings. We retain claims substantiation documents and financial records for seven (7) years following plan year termination as mandated by IRS guidelines, after which all data is securely sanitized or destroyed.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "terms-and-conditions",
      title: "Terms & Conditions",
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-[16px]">
          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">1. Acceptance of Portal Terms of Use</h3>
            <p>
              By accessing, browsing, or logging into the MyAmeriflex participant portal at <strong>participant.ameriflex.com</strong>, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms & Conditions. If you do not agree with these terms, you must immediately cease using the online portal and contact Ameriflex Member Services for alternative offline claims submission options.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">2. Portal Access and User Responsibilities</h3>
            <p>
              You are authorized to use this portal solely for personal, non-commercial purposes related to viewing and administering your Ameriflex-managed employee benefits. You agree not to attempt to gain unauthorized access to any other participant account, probe system vulnerabilities, or introduce automated scraping bots into the portal infrastructure.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">3. Ameriflex Benefit Cardholder Agreement</h3>
            <p className="mb-2">
              If issued an Ameriflex debit card to access your Flexible Spending Account (FSA), Health Savings Account (HSA), or Health Reimbursement Arrangement (HRA), your usage is governed by federal Internal Revenue Code rules:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-slate-600">
              <li><strong>Qualified Expenses Only:</strong> You agree to use the card exclusively to pay for IRS-eligible medical, dental, vision, or commuter expenses incurred during your active coverage period.</li>
              <li><strong>Substantiation Obligation:</strong> You agree to retain itemized receipts and Explanation of Benefits (EOB) statements for every card transaction. When requested by Ameriflex, you must promptly upload or submit itemized proof within the portal.</li>
              <li><strong>Card Suspension & Recovery:</strong> If you fail to substantiate a transaction within the required timeframe or use the card for an ineligible expense, Ameriflex reserves the right to temporarily suspend your debit card and offset the unsubstantiated amount against future claims or request payroll withholding through your employer.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">4. Electronic Communications and Signatures</h3>
            <p>
              By registering an account on participant.ameriflex.com, you consent to receive account notices, tax disclosures (including Form 1099-SA and Form 5498-SA where applicable), and balance updates electronically via email or portal notifications. You agree that any electronic checkbox, digital signature, or submission of a claim certification holds the same binding legal effect as a handwritten ink signature under the Electronic Signatures in Global and National Commerce (E-SIGN) Act.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">5. Disclaimer of Warranties & Limitation of Liability</h3>
            <p>
              While Ameriflex strives to ensure uninterrupted portal availability and accurate balance calculations, the participant portal is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. To the maximum extent permitted by applicable law, Ameriflex shall not be liable for direct, indirect, incidental, or consequential damages resulting from internet service provider outages, delayed banking clearing cycles, or participant errors during direct deposit entry.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">6. Governing Law</h3>
            <p>
              These Terms & Conditions shall be construed and enforced in accordance with applicable federal laws (including ERISA and the Internal Revenue Code) and the laws of the State of Texas, without regard to conflicts of law principles.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "accessibility-statement",
      title: "Accessibility Statement",
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-[16px]">
          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">1. Our Commitment to Digital Inclusion</h3>
            <p>
              Ameriflex is dedicated to ensuring that all participants, including individuals with visual, auditory, motor, or cognitive disabilities, can independently navigate our online portal, submit claims, and manage their employee benefits with ease and dignity. We view digital accessibility as a fundamental right and an integral component of our participant experience.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">2. Conformance with WCAG 2.1 AA Standards</h3>
            <p>
              We continuously design, build, and test our web interfaces against the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA criteria established by the World Wide Web Consortium (W3C). Key accessibility features implemented across participant.ameriflex.com include:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-slate-600">
              <li><strong>Screen Reader Compatibility:</strong> Proper semantic HTML5 tags, ARIA attributes (`aria-expanded`, `aria-label`, `.sr-only`), and structured document outlines optimized for JAWS, NVDA, and VoiceOver.</li>
              <li><strong>Full Keyboard Navigation:</strong> Interactive buttons, form inputs, and accordion sections can be accessed and activated cleanly using Tab, Shift+Tab, and Enter/Space keys without trapping keyboard focus.</li>
              <li><strong>Color Contrast & Visual Clarity:</strong> Text and UI elements maintain high contrast ratios (`4.5:1` or higher) against background surfaces, and visual information is never communicated solely through color cues.</li>
              <li><strong>Responsive Typography:</strong> Pages support up to 200% browser zoom without loss of functionality or overlapping text containers.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">3. Ongoing Testing & Remediation</h3>
            <p>
              Our engineering team conducts regular accessibility audits utilizing automated testing suites (`axe-core`, Lighthouse) supplemented by manual user experience verification. Whenever new portal features or claims workflows are introduced, accessibility reviews are embedded directly into our software development lifecycle.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">4. Requesting Assistance & Feedback</h3>
            <p>
              If you encounter any barrier while utilizing the MyAmeriflex portal or require reasonable accommodation to submit a claim or access account information, our dedicated Member Services team is ready to assist you:
            </p>
            <div className="py-3 mt-3 text-slate-800 font-medium">
              <p>Email Accessibility Support: <a href="mailto:support@ameriflex.com" className="text-[#163e48] underline">support@ameriflex.com</a></p>
              <p className="mt-1">Participant Services Phone: <a href="tel:18888683539" className="text-[#163e48] underline">1-888-868-FLEX (3539)</a> (Mon - Fri, 8:00 AM - 8:00 PM CST)</p>
              <p className="mt-1 text-sm text-slate-600">When contacting us, please specify the exact web page URL and description of the accessibility issue so we can resolve it promptly.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "hsa-custodial-agreement",
      title: "HSA Custodial Agreement",
      content: (
        <div className="space-y-6 text-slate-700 leading-relaxed text-[16px]">
          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">1. Establishment of Health Savings Account (HSA)</h3>
            <p>
              If you have enrolled in a Health Savings Account (HSA) administered through Ameriflex, your account is established as an individual tax-advantaged custodial account governed under Section 223 of the Internal Revenue Code. Ameriflex acts as your third-party account administrator and platform provider, while our chartered FDIC-insured banking partners act as the official Custodian of your HSA cash funds.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">2. Participant Eligibility & Contribution Limits</h3>
            <p>
              To contribute to an HSA, you must be covered under a High Deductible Health Plan (HDHP) on the first day of the month, not be covered by any disqualifying first-dollar health coverage (such as a general-purpose FSA), not be enrolled in Medicare, and not be claimed as a dependent on another individual&apos;s tax return. You are solely responsible for tracking your total annual contributions across employer payroll deductions and personal deposits to ensure they do not exceed IRS annual statutory maximums.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">3. Account Interest, Investments & FDIC Insurance</h3>
            <p>
              Cash balance funds deposited into your standard HSA deposit account are held at FDIC-insured depository institutions up to applicable federal limits (`$250,000` per depositor). Once your HSA cash balance exceeds the designated threshold (`typically $1,000`), you may elect to transfer excess funds into mutual funds or self-directed investment portfolios offered via the portal. Investment assets are not FDIC insured, not bank guaranteed, and may fluctuate in value.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">4. Distributions for Qualified Medical Expenses</h3>
            <p>
              You may withdraw funds from your HSA at any time using your Ameriflex debit card, online bill pay, or electronic bank transfer. Distributions used exclusively to pay or reimburse IRS Qualified Medical Expenses for yourself, your spouse, or your tax dependents are completely federal income tax-free. If you withdraw funds for non-qualified expenses prior to age 65, the distribution is subject to ordinary income tax plus a 20% IRS penalty tax. Unlike FSA accounts, HSA funds roll over indefinitely year after year and never expire.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">5. Annual Tax Reporting & Participant Recordkeeping</h3>
            <p>
              Each tax year, the Custodian will generate and upload Form 1099-SA (reporting total annual distributions) and Form 5498-SA (reporting total annual contributions and fair market value) directly to your secure portal document center. You are responsible for reporting HSA activity on IRS Form 8889 when filing your federal income tax return and retaining receipts for all medical distributions in the event of an IRS tax audit.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-[#163e48] mb-2">6. Account Termination & Transfer Rules</h3>
            <p>
              You maintain ownership (`portability`) of your HSA regardless of employment changes or health plan transitions. You may request a trustee-to-trustee rollover or close your account at any time via the portal, subject to applicable administrative transfer fees outlined in your employer fee schedule.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Normal Simple Header */}
      <SiteHeader />

      {/* Main Content Area */}
      <main className="flex-grow pb-24">
        {/* Page Title & Breadcrumb Header */}
        <div className="border-b border-[#f0e6d2] py-8 px-6 sm:px-12 md:px-16 lg:px-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#254650] uppercase tracking-wider mb-2">
              <Link href="/" className="hover:underline">Home</Link>
              <span>/</span>
              <span className="text-slate-500">Legal & Privacy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#163e48] tracking-tight">
              Privacy Policy & Legal Disclosures
            </h1>
          </div>
        </div>

        {/* Wider Accordion Container without box or shadow, separated by simple divider lines */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-16 lg:px-24 mt-4">
          <div className="w-full">
            {sections.map((section) => {
              const isOpen = openSection === section.id;

              return (
                <div
                  key={section.id}
                  className="border-b border-[#ebd8b7] transition-colors duration-150"
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={isOpen}
                    aria-controls={`panel-${section.id}`}
                    className="w-full py-6 flex items-center text-left focus:outline-none group select-none"
                  >
                    {/* Triangle Arrow exactly matching design */}
                    <span
                      className="mr-3.5 flex-shrink-0 text-[#163e48] transition-transform duration-200 text-xs font-mono select-none"
                      style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                    >
                      ▶
                    </span>

                    {/* Section Title */}
                    <span className="text-lg sm:text-[21px] font-serif font-semibold text-[#163e48] group-hover:text-[#0f2b33] tracking-tight">
                      {section.title}
                    </span>
                  </button>

                  {/* Accordion Content Panel without box/shadow */}
                  {isOpen && (
                    <div
                      id={`panel-${section.id}`}
                      className="pb-10 pt-2 pl-7 pr-4 sm:pr-10 animate-in fade-in-50 duration-200"
                    >
                      {section.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} Ameriflex, LLC. All rights reserved. Official Participant Portal at participant.ameriflex.com.
          </div>
          <div className="flex gap-6">
            <button onClick={() => setOpenSection("privacy-policy")} className="hover:text-slate-800 underline">Privacy Policy</button>
            <button onClick={() => setOpenSection("terms-and-conditions")} className="hover:text-slate-800 underline">Terms of Use</button>
            <button onClick={() => setOpenSection("security")} className="hover:text-slate-800 underline">Security</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
