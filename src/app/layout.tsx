import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import QueryProvider from "@/components/QueryProvider";
import { JsonLd } from "@/components/JsonLd";
import { organizationSchema, websiteSchema, softwareApplicationSchema, baseUrl } from "@/lib/schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl()),
  title: {
    default: 'SiteLens — Sitemap Explorer & SEO Visualizer',
    template: '%s · SiteLens',
  },
  description: 'Scan, visualize, and audit any website sitemap. Check broken links, analyze SEO, validate XML, and export results. No sign-up required.',
  applicationName: 'SiteLens',
  keywords: ['sitemap', 'sitemap explorer', 'SEO audit', 'broken link checker', 'xml validator', 'crawler', 'site structure'],
  authors: [{ name: 'SiteLens' }],
  creator: 'SiteLens',
  publisher: 'SiteLens',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'SiteLens — Sitemap Explorer & SEO Visualizer',
    description: 'Scan, visualize, and audit any website sitemap. Check broken links, analyze SEO, validate XML.',
    siteName: 'SiteLens',
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: 'SiteLens — Visualize your sitemap instantly' },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SiteLens — Sitemap Explorer & SEO Visualizer',
    description: 'Scan, visualize, and audit any website sitemap.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <JsonLd data={[organizationSchema(), websiteSchema(), softwareApplicationSchema()]} />
        <QueryProvider>
          {children}
        </QueryProvider>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "ugs43ob8r6");
          `}
        </Script>
      </body>
    </html>
  );
}
