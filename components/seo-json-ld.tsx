import type React from "react";
import { SITE_DISPLAY_NAME, SITE_HOMEPAGE_CANONICAL, SITE_ORIGIN } from "@/lib/site-url";

/**
 * Structured data for the landing page. Rendered by BOTH renderers:
 *   - Astro landing head/body (`astro-src/pages/index.astro`)
 *   - Next root layout for every other route (`app/layout.tsx`)
 *
 * Named export only — `import { SeoJsonLd } from "@/components/seo-json-ld"`.
 * The content is the historical inline `jsonLd` graph from `app/layout.tsx`,
 * preserved verbatim so structured data does not drift across the conversion.
 */

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_HOMEPAGE_CANONICAL}#organization`,
      name: "Ameriflex",
      url: SITE_HOMEPAGE_CANONICAL,
      logo: `${SITE_ORIGIN}/og-image.png`,
      description:
        "Ameriflex provides leading employee benefits solutions including Flexible Spending Accounts (FSA), Health Savings Accounts (HSA), COBRA, and commuter administration.",
      sameAs: ["https://www.ameriflex.com/"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_HOMEPAGE_CANONICAL}#website`,
      url: SITE_HOMEPAGE_CANONICAL,
      name: SITE_DISPLAY_NAME,
      description:
        "Official Ameriflex login portal to manage FSA benefits, check spending account balances, and submit claims online.",
      alternateName: ["Ameriflex", "Ameriflex Login", "Ameriflex Portal"],
      publisher: {
        "@id": `${SITE_HOMEPAGE_CANONICAL}#organization`,
      },
      inLanguage: "en-US",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_HOMEPAGE_CANONICAL}#webpage`,
      url: SITE_HOMEPAGE_CANONICAL,
      name: "Ameriflex Login – MyAmeriflex Participant Portal & FSA Account",
      description:
        "Securely log in to access your Ameriflex Flexible Spending Account (FSA), check balances, file claims, and manage your employee benefits.",
      isPartOf: {
        "@id": `${SITE_HOMEPAGE_CANONICAL}#website`,
      },
      about: {
        "@id": `${SITE_HOMEPAGE_CANONICAL}#organization`,
      },
      inLanguage: "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_HOMEPAGE_CANONICAL}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_HOMEPAGE_CANONICAL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Sign In",
          item: SITE_HOMEPAGE_CANONICAL,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_HOMEPAGE_CANONICAL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "How do I log in to my Ameriflex or MyAmeriflex account?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "To log in to your Ameriflex or MyAmeriflex participant account, enter your registered email address and password on this official Ameriflex participant portal.",
          },
        },
        {
          "@type": "Question",
          name: "Where can I check my Ameriflex card balance and Flexible Spending Account (FSA)?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Once logged in to the MyAmeriflex portal, you can view your Ameriflex card balance, manage your Ameriflex FSA (Flexible Spending Account), review recent transactions, and submit new reimbursement claims instantly.",
          },
        },
        {
          "@type": "Question",
          name: "What should I do if I need Ameriflex flex spending help or forgot my password?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "If you forgot your Ameriflex log in password or need help with your Ameriflex flex spending account, click the 'Forgot your password?' link below the login card to securely reset your credentials.",
          },
        },
        {
          "@type": "Question",
          name: "Does Ameriflex provide industrial vinyl products alongside employee benefits?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "This official portal specifically serves Ameriflex participant employee benefits, including Flexible Spending Accounts (FSA), Health Savings Accounts (HSA), commuter benefits, and COBRA administration.",
          },
        },
      ],
    },
  ],
};

export function SeoJsonLd(): React.ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default SeoJsonLd;
