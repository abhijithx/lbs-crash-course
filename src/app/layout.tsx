import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "sonner";
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
    "Master the LBS MCA Entrance Examination with the official Kerala preparation platform. Access live classes, interactive quizzes, comprehensive mock tests, and previous year sorted papers. Join the community of successful MCA students today.",
  keywords: [
    "LBS MCA Entrance 2025",
    "LBS Center MCA preparation",
    "Kerala MCA Entrance Coaching",
    "MCA Entrance Kerala Syllabus",
    "LBS MCA Previous Year Papers",
    "MCA Entrance Mock Test Kerala",
    "LBS MCA Mock Test series",
    "Kerala State MCA Entrance Exam",
  ],
  authors: [{ name: "LBS MCA Entrance Team", url: "https://lbscourse.cetmca.in" }],
  creator: "LBS MCA Team",
  publisher: "LBS MCA",
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
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "LBS MCA Entrance Preparation Official Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerala LBS MCA Entrance Preparation Platform",
    description: "Launch your MCA career with expert guidance. Comprehensive LBS MCA coaching with mock tests and live classes.",
    images: ["/icon.png"],
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
        <Script id="local-business-schema" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "LBS MCA Entrance Preparation Center",
              "image": "https://lbscourse.cetmca.in/icon.png",
              "@id": "https://lbscourse.cetmca.in",
              "url": "https://lbscourse.cetmca.in",
              "telephone": "+917012823414",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Kannur",
                "addressLocality": "Kannur",
                "addressRegion": "Kerala",
                "postalCode": "670001",
                "addressCountry": "IN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 11.8745,
                "longitude": 75.3704
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "00:00",
                "closes": "23:59"
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
              "url": "https://lbscourse.cetmca.in",
              "description": "Premier online learning platform for LBS MCA Entrance Examination preparation. Comprehensive MCA coaching with live classes, recorded lectures, mock tests, and previous year papers.",
              "logo": "https://lbscourse.cetmca.in/icon.png",
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
              "url": "https://lbscourse.cetmca.in",
              "description": "Prepare for LBS MCA Entrance Examination with live classes, recorded lectures, quizzes, mock tests, and previous year papers",
              "publisher": {
                "@type": "Organization",
                "name": "LBS MCA"
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
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://lbscourse.cetmca.in/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Privacy Policy",
                  "item": "https://lbscourse.cetmca.in/privacy-policy"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Terms of Service",
                  "item": "https://lbscourse.cetmca.in/terms-of-service"
                },
                {
                  "@type": "ListItem",
                  "position": 4,
                  "name": "Contact Us",
                  "item": "https://lbscourse.cetmca.in/contact"
                }
              ]
            })
          }}
        />
        <Script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" />
        <Script id="onesignal-init">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              try {
                // Only initialize OneSignal if we are on the production domain
                if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                  await OneSignal.init({
                    appId: "3936b2f0-0dd0-4912-b5a4-9e091640e947",
                    safari_web_id: "web.onesignal.auto.204803f7-478b-4564-9a97-0318e873c676",
                    notifyButton: {
                      enable: true,
                    },
                  });
                } else {
                  console.log("OneSignal: Skipping initialization on localhost");
                }
              } catch (e) {
                console.error("OneSignal initialization error:", e);
              }
            });
          `}
        </Script>
        <AuthProvider>
          {children}
          <ToolPixOverlay />
          <FirebaseHealthPanel />
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
