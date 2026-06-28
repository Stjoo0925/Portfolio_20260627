import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR, Playfair_Display } from "next/font/google";
import { siteConfig } from "@/lib/site";
import { loadSections } from "@/lib/content/load";
import { PortfolioShell } from "@/components/layout/portfolio-shell";
import { SmoothScrollProvider } from "@/providers/smooth-scroll-provider";
import { DetailPanelProvider } from "@/providers/detail-panel-provider";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sections = loadSections();

  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${playfairDisplay.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full select-none font-sans">
        <DetailPanelProvider>
          <SmoothScrollProvider>
            <PortfolioShell sections={sections}>{children}</PortfolioShell>
          </SmoothScrollProvider>
        </DetailPanelProvider>
      </body>
    </html>
  );
}
