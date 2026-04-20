import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ToolPixOverlay from "@/components/ai/ToolPixOverlay";
import FirebaseHealthPanel from "@/components/dev/FirebaseHealthPanel";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lbscourse.cetmca.in"),
  applicationName: "LBS MCA Entrance Platform",
  title: {
    default: "LBS MCA Entrance Preparation - Official Training for Kerala MCA Aspirants",
    template: "%s | LBS MCA Entrance Preparation",
  },
  description:
    "Master the LBS MCA Entrance Examination 2026 with the premier preparation platform for Kerala and South India. Access live sessions, expert mentorship, and high-rank mock tests. Trusted by MCA aspirants across Kerala, Tamil Nadu, and neighboring states.",
  keywords: [
    "LBS MCA Entrance 2026",
    "Kerala MCA Entrance Coaching",
    "LBS Center Kerala MCA syllabus",
    "Tamil Nadu MCA Entrance preparation",
    "MCA Entrance South India",
    "Best MCA coaching in Kerala",
    "LBS MCA Mock Test series 2026",
    "LBS MCA Previous Year Papers",
  ],
  authors: [{ name: "Infronixis Technologies", url: "https://lbscourse.cetmca.in" }],
  creator: "Infronixis Technologies",
  publisher: "Infronixis Technologies",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  category: "education",
  classification: "Educational Coaching",
  verification: {
    google: "google83f8616f6a5b1974",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Official LBS MCA Entrance Preparation Platform",
    description:
      "Elite coaching for Kerala LBS MCA aspirants. Live sessions, recorded classes, and rank-boosting mock tests. Start your preparation now.",
    siteName: "LBS MCA Entrance Platform",
    locale: "en_IN",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LBS MCA Entrance 2026 Preparation Course - Official Banner",
      },
    ],
    videos: [
      {
        url: "https://www.youtube.com/embed/NEeRp3s9eoA",
        width: 1280,
        height: 720,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerala LBS MCA Entrance Preparation Platform",
    description: "Launch your MCA career with expert guidance. Comprehensive LBS MCA coaching with mock tests and live classes.",
    images: ["/og-image.png"],
    creator: "@lbsmca",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LBS MCA",
  },
};

export const viewport: Viewport = {
  themeColor: "#5E9EA2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = "https://lbscourse.cetmca.in";
  const oneSignalId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "3936b2f0-0dd0-4912-b5a4-9e091640e947";

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var key = "${THEME_STORAGE_KEY}";
                var stored = localStorage.getItem(key);
                var pref = (stored === "light" || stored === "dark" || stored === "system") ? stored : "system";
                var resolved = pref === "system"
                  ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
                  : pref;
                var root = document.documentElement;
                root.classList.toggle("dark", resolved === "dark");
                root.setAttribute("data-theme", resolved);
                root.style.colorScheme = resolved;
              } catch (e) {}
            })();
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Structured Data / Schemas */}
        <Script id="local-business-schema" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "LBS MCA Entrance Preparation Center by Infronixis",
              "image": `${baseUrl}/og-image.png`,
              "@id": baseUrl,
              "url": baseUrl,
              "telephone": "+917012823414",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Kannur",
                "addressLocality": "Kannur",
                "addressRegion": "Kerala",
                "postalCode": "670001",
                "addressCountry": "IN"
              },
              "areaServed": [
                { "@type": "State", "name": "Kerala" },
                { "@type": "State", "name": "Tamil Nadu" },
                { "@type": "Country", "name": "India" }
              ],
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 11.8745,
                "longitude": 75.3704
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00",
                "closes": "23:59"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "1280",
                "bestRating": "5",
                "worstRating": "1"
              }
            })
          }}
        />
        <Script id="org-schema" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "LBS MCA",
              "alternateName": "LBS Centre for Science and Technology",
              "url": baseUrl,
              "description": "Premier online learning platform for LBS MCA Entrance Examination preparation.",
              "logo": `${baseUrl}/icon.png`,
              "brand": {
                "@type": "Brand",
                "name": "LBS MCA Entrance"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+917012823414",
                "contactType": "customer service",
                "email": "cetmca2025@gmail.com",
                "availableLanguage": ["English", "Malayalam"]
              }
            })
          }}
        />
        <Script id="website-schema" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "LBS MCA Entrance Learning Platform",
              "url": baseUrl,
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${baseUrl}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <Script id="breadcrumb-schema" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}/` },
                { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": `${baseUrl}/privacy-policy` },
                { "@type": "ListItem", "position": 3, "name": "Terms of Service", "item": `${baseUrl}/terms-of-service` },
                { "@type": "ListItem", "position": 4, "name": "Contact Us", "item": `${baseUrl}/contact` }
              ]
            })
          }}
        />
        <Script id="video-schema" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "VideoObject",
              "name": "LBS MCA Entrance 2026 Course Introduction",
              "description": "Watch the official introduction to the LBS MCA Entrance 2026 Crash Course preparation platform for Kerala MCA aspirants.",
              "thumbnailUrl": [
                "https://img.youtube.com/vi/NEeRp3s9eoA/maxresdefault.jpg",
                "https://img.youtube.com/vi/NEeRp3s9eoA/hqdefault.jpg"
              ],
              "uploadDate": "2026-04-20T08:00:00+05:30",
              "contentUrl": "https://youtu.be/NEeRp3s9eoA",
              "embedUrl": "https://www.youtube.com/embed/NEeRp3s9eoA",
              "interactionStatistic": {
                "@type": "InteractionCounter",
                "interactionType": { "@type": "WatchAction" },
                "userInteractionCount": 1200
              },
              "regionsAllowed": "IN"
            })
          }}
        />

        {/* Third-party Scripts */}
        <Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" strategy="afterInteractive" />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              try {
                if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                  await OneSignal.init({
                    appId: "${oneSignalId}",
                    safari_web_id: "web.onesignal.auto.204803f7-478b-4564-9a97-0318e873c676",
                    notifyButton: { enable: false }, // Removed bell icon
                    allowLocalhostAsSecureOrigin: true
                  });

                  // Trigger permission prompt if not already granted
                  if (OneSignal.Notifications.permission !== true) {
                    // Slight delay to be less intrusive
                    setTimeout(async () => {
                      try {
                        await OneSignal.Slidedown.promptPush();
                      } catch (err) {
                        console.error("Prompt error:", err);
                      }
                    }, 3000);
                  }
                }
              } catch (e) {
                console.error("OneSignal error:", e);
              }
            });
          `}
        </Script>

        <AuthProvider>
          {children}
          <ToolPixOverlay />
          <FirebaseHealthPanel />
          <Analytics />
          <SpeedInsights />
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4200,
              style: {
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                boxShadow: "0 14px 34px -16px rgba(2, 8, 23, 0.45)",
              },
              classNames: {
                toast: "app-toast",
                title: "app-toast-title",
                description: "app-toast-description",
                error: "app-toast-error",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

