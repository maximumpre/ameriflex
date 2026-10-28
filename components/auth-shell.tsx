"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

/**
 * The landing composition, shared by EVERY page that must look like the
 * Ameriflex portal: the `/` landing (Astro island) and the Next.js
 * verification routes (Verification Method Selection, One-Time Passcode
 * Entry, Identity Verification Details).
 *
 * Chrome reproduced from https://participant.myameriflex.com/:
 *   body (75px top / 40px bottom padding, fixed background — seasonal at
 *   >= 992px, Mountains_Mobile.jpg below)
 *     └ #wrapper > .container > main > .container
 *         └ .col-xs-12 .col-sm-offset-2 .col-sm-8 .col-md-offset-3 .col-md-6
 *             ├ white Ameriflex wordmark (5rem, identical src/alt everywhere)
 *             └ .login-panel > {children}
 *
 * Stylesheet chain mirrors astro-src/components/seo-head.astro exactly
 * (fonts → bootstrap → font awesome → target's custom login CSS). React 19
 * hoists `precedence`-tagged links after the Next global stylesheet, so the
 * target's cascade wins over Tailwind preflight on every Next route.
 */

const SEASONAL_BACKGROUNDS = [
  { img: "Background1.jpg", month: 1, day: 1 },
  { img: "Background2.jpg", month: 3, day: 19 },
  { img: "Background3.jpg", month: 6, day: 21 },
  { img: "Background4.jpg", month: 9, day: 23 },
  { img: "Background1.jpg", month: 12, day: 21 },
] as const;

function pickSeasonalBackground(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const passed = SEASONAL_BACKGROUNDS.filter(
    (s) => month > s.month || (month === s.month && day >= s.day),
  );
  const chosen = passed.length ? passed[passed.length - 1] : SEASONAL_BACKGROUNDS[0];
  return chosen.img;
}

export default function AuthShell({ children }: { children: ReactNode }) {
  // OBSERVED target behavior: seasonal background only at >= 992px wide,
  // applied once at load (the target has no resize listener — do not invent one).
  useEffect(() => {
    if (window.innerWidth >= 992) {
      document.body.style.background = `url(/target-assets/${pickSeasonalBackground()}) no-repeat center center fixed`;
      document.body.style.backgroundSize = "cover";
    }
    return () => {
      document.body.style.background = "";
      document.body.style.backgroundSize = "";
    };
  }, []);

  return (
    <>
      <link
        rel="stylesheet"
        precedence="landing"
        href="/target-assets/fonts.css"
      />
      <link
        rel="stylesheet"
        precedence="landing"
        href="/target-assets/bootstrap.min.css"
      />
      <link
        rel="stylesheet"
        precedence="landing"
        href="/target-assets/fontawesome/css/font-awesome.min.css"
      />
      <link
        rel="stylesheet"
        precedence="landing"
        href="/target-assets/landing.css"
      />

      <div id="wrapper">
        <div className="container">
          <main>
            <div className="container">
              <div className="col-xs-12 col-sm-offset-2 col-sm-8 col-md-offset-3 col-md-6">
                <p className="text-center" style={{ marginBottom: "10px" }}>
                  <img
                    title="Mobile Logo"
                    style={{ height: "5rem" }}
                    src="/target-assets/infinite-logo-white.svg"
                    alt="Ameriflex Home"
                  />
                </p>
                <div className="login-panel">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
