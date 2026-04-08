"use client";

import Script from "next/script";

export default function GoogleAnalytics() {
  // Prevent running on localhost (development)
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-33C7XZ028K"
        strategy="afterInteractive"
      />
      <Script id="ga-script" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-33C7XZ028K');
        `}
      </Script>
    </>
  );
}
