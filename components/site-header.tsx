"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isVerifyPage = pathname.startsWith("/verify");
  return (
    <header
      style={{
        background: "#fff",
        borderBottom: "3px solid #00b4c8",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        position: "relative",
        zIndex: 10,
      }}
      className="site-header"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}
      >
        {isVerifyPage ? (
          <img src="/infinite-logo-white.svg" alt="Ameriflex" style={{ height: "42px", width: "auto", filter: "drop-shadow(1.5px 1.5px 0px #1a7b8f) drop-shadow(-1.5px -1.5px 0px #1a7b8f)" }} />
        ) : (
          /* Navia logo reproduced as inline SVG from the provided screenshot */
          <svg
          style={{ height: "42px", width: "auto" }}
          viewBox="0 0 160 50"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Flame / leaf icon */}
          <g>
            {/* red teardrop left */}
            <ellipse
              cx="20"
              cy="26"
              rx="9"
              ry="13"
              fill="#c0392b"
              transform="rotate(-20 20 26)"
            />
            {/* teal teardrop right */}
            <ellipse
              cx="31"
              cy="26"
              rx="7"
              ry="11"
              fill="#00b4c8"
              transform="rotate(20 31 26)"
            />
            {/* yellow accent */}
            <ellipse
              cx="25"
              cy="20"
              rx="5"
              ry="8"
              fill="#f39c12"
              transform="rotate(-5 25 20)"
              opacity="0.85"
            />
            {/* small circle base */}
            <circle cx="25" cy="36" r="5" fill="#2a2a2a" />
          </g>
          {/* "navia" wordmark */}
          <text
            x="44"
            y="30"
            fontFamily="'Open Sans', sans-serif"
            fontSize="18"
            fontWeight="700"
            fill="#2a2a2a"
            letterSpacing="-0.3"
          >
            navia
          </text>
          {/* "benefit solutions" tagline */}
          <text
            x="44"
            y="41"
            fontFamily="'Open Sans', sans-serif"
            fontSize="7.5"
            fill="#777"
            letterSpacing="0.4"
          >
            benefit solutions
          </text>
        </svg>
        )}
      </div>

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {isLandingPage && (
          <div
            style={{
              display: "flex",
              gap: "5px",
              alignItems: "center",
              marginRight: "6px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#00b4c8",
                display: "block",
              }}
            ></span>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#00b4c8",
                display: "block",
              }}
            ></span>
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#00b4c8",
                display: "block",
              }}
            ></span>
          </div>
        )}
        {isLandingPage && (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "1px",
              color: "#555",
              textTransform: "uppercase",
              marginRight: "10px",
              cursor: "pointer",
            }}
            className="menu-label"
          >
            Menu
          </span>
        )}
        {isLandingPage && (
          <>
            <a
              href="/"
              style={{
                background: "#c0392b",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
            >
              log in →
            </a>
            <a
              href="/new-user"
              style={{
                background: "#c0392b",
                color: "#fff",
                border: "2px solid #c0392b",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textDecoration: "none",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              register ↑
            </a>
          </>
        )}
      </nav>
    </header>
  );
}
