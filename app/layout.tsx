import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import CookieConsent from "@/components/CookieConsent";

const noto = Noto_Sans_Devanagari({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: {
    default: "LucknowKaam - भारत में नौकरी खोजें | India's #1 Hindi Job Site",
    template: "%s | LucknowKaam - भारत में नौकरी",
  },
  description:
    "पूरे भारत में नौकरी खोजें। डिलीवरी, दुकान, ड्राइवर, डेटा एंट्री, टीचिंग और हजारों नौकरियां — बिल्कुल मुफ्त। LucknowKaam भारत की #1 हिंदी जॉब साइट है।",
  keywords: [
    "भारत में नौकरी",
    "India jobs",
    "हिंदी नौकरी",
    "डिलीवरी बॉय जॉब",
    "LucknowKaam",
    "नौकरी खोजें",
    "local jobs India",
  ],
  metadataBase: new URL("https://lucknowkaam.vercel.app"),
  openGraph: {
    title: "LucknowKaam - भारत में नौकरी खोजें",
    description:
      "पूरे भारत में नौकरी खोजें। डिलीवरी, दुकान, ड्राइवर, डेटा एंट्री और हजारों नौकरियां — बिल्कुल मुफ्त।",
    url: "https://lucknowkaam.vercel.app",
    siteName: "LucknowKaam",
    locale: "hi_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LucknowKaam - भारत में नौकरी खोजें",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LucknowKaam - भारत में नौकरी खोजें",
    description:
      "पूरे भारत में नौकरी खोजें। डिलीवरी, दुकान, ड्राइवर, डेटा एंट्री और हजारों नौकरियां — बिल्कुल मुफ्त।",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://lucknowkaam.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <head>
        <meta name="google-site-verification" content="QthBs8cJTKZIfozdvVyydJU65ta_cOUBXO-lDYAOZvU" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2580771948177805"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "LucknowKaam",
              url: "https://lucknowkaam.vercel.app",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://lucknowkaam.vercel.app/jobs?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
              description:
                "भारत में नौकरी खोजें - LucknowKaam",
              inLanguage: "hi",
            }),
          }}
        />
      </head>
      <body className={`${noto.variable} font-hindi bg-background text-text-primary antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:p-4 focus:bg-primary focus:text-white focus:outline-none">
          मुख्य सामग्री पर जाएं
        </a>
        <Header />
        <main id="main-content" className="min-h-screen">{children}</main>
        <Footer />
        <MobileNav />
        <CookieConsent />
      </body>
    </html>
  );
}
