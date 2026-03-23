import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fieldform — Build powerful forms in minutes, not hours",
  description:
    "The modern form builder for teams. Create forms, collect submissions, automate workflows, and integrate with your stack.",
  keywords: ["form builder", "forms", "workflow automation", "analytics", "integrations"],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Fieldform",
    description:
      "Build powerful forms in minutes, not hours. Collect data and automate workflows.",
    url: "/",
    siteName: "Fieldform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fieldform",
    description:
      "Build powerful forms in minutes, not hours. Collect data and automate workflows.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
