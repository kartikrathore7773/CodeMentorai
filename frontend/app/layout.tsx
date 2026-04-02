import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import CursorGlow from "@/components/ui/CursorGlow";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Providers } from "./providers";
import Script from "next/script";

export const metadata = {
  metadataBase: new URL("https://codementor.ai"),
  title:
    "CodeMentor AI | Startup Development, Coding Skills & Tech Career Guidance",
  description:
    "CodeMentor AI helps developers learn coding, build startups, and grow their tech careers with practical courses, projects, and job guidance.",

  keywords: [
    "CodeMentor AI",
    "CodeMentor AI startup platform",
    "startup development",
    "startup guidance India",
    "coding courses",
    "web development course",
    "mern stack development",
    "software development training",
    "tech career growth",
    "learn programming online",
    "coding mentorship",
    "developer career roadmap",
    "programming tutorials",
    "startup learning platform",
    "online tech education",
    "developer community India",
    "job guidance for developers",
    "learn coding from scratch",
    "web development mentorship",
  ],

  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",

  openGraph: {
    title: "CodeMentor AI | Learn Coding & Build Startups",
    description:
      "Learn coding, build real startup projects, and grow your tech career with CodeMentor AI.",
    url: "https://codementor.ai",
    siteName: "CodeMentor AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://codementor.ai/og-image.png",
        width: 1200,
        height: 630,
        alt: "CodeMentor AI Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeMentor AI",
    description: "AI-powered mentorship for developers",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://codementor.ai",
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
  authors: [{ name: "Kartik Singh Rathore", url: "https://codementor.ai" }],
  creator: "Kartik Singh Rathore",
  publisher: "CodeMentor AI",
  category: "technology",
  applicationName: "CodeMentor AI",
  verification: {
    google: "google-site-verification-code",
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* Load site fonts globally to avoid per-component @import and hydration mismatches */}
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-black">
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
        </Script>

        {/* microsoft clarity  */}
        <Script id="clarity" strategy="afterInteractive">
          {`
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "vujs54pix1");
                `}
        </Script>

        {/* Schema JSON-LD */}
        {/* Schema JSON-LD */}
        <Script id="schema-org" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "CodeMentor AI",
            url: "https://codementor.ai",
            logo: "https://codementor.ai/logo.png",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://codementor.ai/search?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
            sameAs: [
              "https://www.linkedin.com/in/kartikrathore7773/",
              "https://github.com/kartikrathore7773",
            ],
          })}
        </Script>

        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <CursorGlow />
          <Navbar />
          <Providers>{children}</Providers>

          <Toaster position="top-right" reverseOrder={false} />
          <Footer />
        </GoogleOAuthProvider>

        {/* Razorpay Script */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
