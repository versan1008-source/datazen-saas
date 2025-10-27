import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DataZen - Real-Time AI Web Scraper",
  description: "Extract text, images, links, or emails from any public website instantly. Powered by AI for intelligent data structuring and analysis.",
  keywords: ["web scraping", "data extraction", "AI", "automation", "data mining"],
  authors: [{ name: "DataZen Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "DataZen - Real-Time AI Web Scraper",
    description: "Extract data from any website instantly with AI-powered analysis",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DataZen - Real-Time AI Web Scraper",
    description: "Extract data from any website instantly with AI-powered analysis",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
