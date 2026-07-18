import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy, Security & Legal Disclosures",
  description: "Official Ameriflex legal policies including our Privacy Policy, Security Standards, Terms & Conditions, Accessibility Statement, and HSA Custodial Agreement.",
  keywords: [
    "Ameriflex privacy policy",
    "Ameriflex security",
    "Ameriflex terms and conditions",
    "Ameriflex accessibility statement",
    "HSA custodial agreement",
    "MyAmeriflex participant privacy",
  ],
  alternates: {
    canonical: "https://participant.ameriflex.com/privacy-policy",
  },
  openGraph: {
    title: "Ameriflex Privacy Policy & Security Disclosures",
    description: "Review comprehensive data privacy, security encryption, terms of service, and accessibility commitments for MyAmeriflex participants.",
    url: "https://participant.ameriflex.com/privacy-policy",
  },
};

export default function PrivacyPolicyRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
