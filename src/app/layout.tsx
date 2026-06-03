import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F2747',
}

export const metadata: Metadata = {
  title: "永豐 AI 法規檢核助手",
  description: "台中市建築法規 AI 自動檢核系統",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '永豐AI',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icons/180',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* PWA: iOS Safari */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="永豐AI" />
        {/* PWA: Android Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Apple touch icon — 180×180 PNG generated via route handler */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/180" />
        {/* Splash screen colors */}
        <meta name="msapplication-TileColor" content="#2563eb" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
