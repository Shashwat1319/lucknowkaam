import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export const metadata: Metadata = {
  title: {
    default: "LucknowKaam - लखनऊ में नौकरी खोजें | लखनऊ की #1 जॉब साइट",
    template: "%s | LucknowKaam - लखनऊ में नौकरी",
  },
  description:
    "लखनऊ में नौकरी खोजें। डिलीवरी, दुकान, ड्राइवर, डेटा एंट्री, टीचिंग और हजारों नौकरियां — बिल्कुल मुफ्त। LucknowKaam लखनऊ की #1 लोकल जॉब साइट है।",
  keywords: [
    "लखनऊ नौकरी",
    "Lucknow jobs",
    "लखनऊ में नौकरी",
    "Lucknow local jobs",
    "डिलीवरी बॉय जॉब",
    "लखनऊ काम",
    "LucknowKaam",
  ],
  metadataBase: new URL("https://lucknowkaam.vercel.app"),
  openGraph: {
    title: "LucknowKaam - लखनऊ में नौकरी खोजें",
    description:
      "लखनऊ में नौकरी खोजें। डिलीवरी, दुकान, ड्राइवर, डेटा एंट्री और हजारों नौकरियां — बिल्कुल मुफ्त।",
    url: "https://lucknowkaam.vercel.app",
    siteName: "LucknowKaam",
    locale: "hi_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LucknowKaam - लखनऊ में नौकरी",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LucknowKaam - लखनऊ में नौकरी खोजें",
    description:
      "लखनऊ में नौकरी खोजें। डिलीवरी, दुकान, ड्राइवर, डेटा एंट्री और हजारों नौकरियां — बिल्कुल मुफ्त।",
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
                    "https://lucknowkaam.vercel.app/?search={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
              description:
                "लखनऊ में नौकरी खोजें - LucknowKiNaukri",
              inLanguage: "hi",
            }),
          }}
        />
      </head>
      <body className="font-hindi bg-background text-text-primary antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
