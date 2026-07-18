"use client";

import React from "react";
import Link from "next/link";

export function SiteFooter({
  className = "w-full bg-gray-100 mt-auto",
}: {
  className?: string;
}) {
  return (
    <footer style={{
      background: '#3a3a3a',
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px'
    }} className="site-footer">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
      }}>
        {/* Ameriflex logo mark / small icon */}
        <img src="/infinite-logo-white.svg" alt="Ameriflex" style={{ height: '22px', width: 'auto', opacity: 0.85 }} />
        <span style={{
          color: '#ccc',
          fontSize: '11.5px'
        }}>© 2026, Ameriflex, LLC. All rights reserved.</span>
        <div style={{
          display: 'flex',
          gap: 0,
          flexWrap: 'wrap'
        }}>
          <a href="mailto:support@ameriflex.com" style={{
            color: '#ccc',
            fontSize: '11.5px',
            textDecoration: 'none',
            padding: '0 8px',
            borderRight: '1px solid #666',
            transition: 'color 0.2s'
          }}>Feedback</a>
          <Link href="/privacy-policy" style={{
            color: '#ccc',
            fontSize: '11.5px',
            textDecoration: 'none',
            padding: '0 8px',
            borderRight: '1px solid #666',
            transition: 'color 0.2s'
          }}>Help</Link>
          <Link href="/privacy-policy" style={{
            color: '#ccc',
            fontSize: '11.5px',
            textDecoration: 'none',
            padding: '0 8px',
            borderRight: '1px solid #666',
            transition: 'color 0.2s'
          }}>Privacy Policy</Link>
          <Link href="/privacy-policy" style={{
            color: '#ccc',
            fontSize: '11.5px',
            textDecoration: 'none',
            padding: '0 8px',
            borderRight: '1px solid #666',
            transition: 'color 0.2s'
          }}>Privacy Notice</Link>
          <Link href="/privacy-policy" style={{
            color: '#ccc',
            fontSize: '11.5px',
            textDecoration: 'none',
            padding: '0 8px',
            transition: 'color 0.2s'
          }}>Terms &amp; Conditions</Link>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          display: 'flex',
          gap: '6px'
        }}>
          <a href="#" style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            fontSize: '14px',
            color: '#fff',
            transition: 'opacity 0.2s',
            background: '#3b5998'
          }}>f</a>
          <a href="#" style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            fontSize: '14px',
            color: '#fff',
            transition: 'opacity 0.2s',
            background: '#1da1f2'
          }}>𝕏</a>
          <a href="#" style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            fontSize: '14px',
            color: '#fff',
            transition: 'opacity 0.2s',
            background: '#ff0000'
          }}>▶</a>
          <a href="#" style={{
            width: '30px',
            height: '30px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            fontSize: '14px',
            color: '#fff',
            transition: 'opacity 0.2s',
            background: '#0077b5'
          }}>in</a>
        </div>
        <div style={{
          border: '1px solid #888',
          borderRadius: '4px',
          padding: '4px 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1px'
        }}>
          <span style={{
            fontSize: '9px',
            color: '#aaa',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>Accredited</span>
          <span style={{
            fontSize: '15px',
            fontWeight: 900,
            color: '#00b4c8',
            letterSpacing: '-0.5px'
          }}>BBB</span>
          <span style={{
            fontSize: '7px',
            color: '#aaa',
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}>Business</span>
        </div>
      </div>
    </footer>
  );
}
