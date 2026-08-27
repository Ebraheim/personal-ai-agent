import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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
  metadataBase: new URL("https://gradfolio-ai.vercel.app"),
  title: {
    default: "Gradfolio | Turn Your CV Into a Career Website",
    template: "%s | Gradfolio",
  },
  description:
    "Gradfolio turns a student or graduate CV into a polished AI-powered career website with projects, skills, education, experience, achievements, and a verified AI assistant.",
  applicationName: "Gradfolio",
  keywords: [
    "Gradfolio",
    "student portfolio",
    "graduate portfolio",
    "CV website",
    "career website",
    "AI portfolio",
    "personal website",
  ],
  authors: [{ name: "Gradfolio" }],
  creator: "Gradfolio",
  publisher: "Gradfolio",
  openGraph: {
    type: "website",
    url: "https://gradfolio-ai.vercel.app",
    siteName: "Gradfolio",
    title: "Gradfolio | Turn Your CV Into a Career Website",
    description:
      "Turn your CV, projects, skills, education, and experience into a polished career website that speaks for you.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Gradfolio — Turn your CV into a website that speaks for you.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gradfolio | Turn Your CV Into a Career Website",
    description:
      "Turn your CV into a polished AI-powered career website for recruiters.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}