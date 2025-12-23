import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://medical-extraction.vercel.app"),
  title: "Medical Information Extraction",
  description: "Extract structured cancer information from clinical text using AI-powered analysis. Identifies cancer type, stage, gene mutations, biomarkers, treatments, and more.",
  openGraph: {
    title: "Medical Information Extraction",
    description: "Extract structured cancer information from clinical text using AI-powered analysis.",
    url: "https://medical-extraction.vercel.app",
    siteName: "Medical Information Extraction",
    images: [
      {
        url: "/preview.jpg",
        width: 1200,
        height: 630,
        alt: "Medical Information Extraction - AI-powered clinical text analysis",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Medical Information Extraction",
    description: "Extract structured cancer information from clinical text using AI-powered analysis.",
    images: ["/preview.jpg"],
  },
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
        {children}
      </body>
    </html>
  );
}
