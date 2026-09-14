import "./globals.css";

import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "@usesend/ui";
import Script from "next/script";
import { SITE_URL } from "~/lib/site-config";
import { APP_DESCRIPTION, APP_NAME } from "~/lib/brand";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: `${APP_NAME} – ${APP_DESCRIPTION}`,
  description: APP_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: `${APP_NAME} – ${APP_DESCRIPTION}`,
    description: APP_DESCRIPTION,
    url: SITE_URL,
    siteName: APP_NAME,
    images: [
      {
        url: `${SITE_URL}/logo_light.PNG`,
        width: 1200,
        height: 1200,
        alt: `${APP_NAME} – ${APP_DESCRIPTION}`,
        type: "image/png",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} – ${APP_DESCRIPTION}`,
    description: APP_DESCRIPTION,
    images: [`${SITE_URL}/logo_light.PNG`],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth bg-background"
    >
      {process.env.NODE_ENV === "production" && (
        <Script src="https://scripts.simpleanalyticscdn.com/latest.js" />
      )}
      <body
        className={`font-mono ${inter.variable} ${jetbrainsMono.variable} bg-background`}
      >
        {/* System theme with isolated storage to avoid stale overrides */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="marketing-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
