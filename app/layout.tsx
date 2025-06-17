import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import SessionProviderWrapper from "./SessionProviderWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "Masar - Career Development Platform",
  description: "Build your career roadmap and achieve your professional goals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="antialiased" suppressHydrationWarning>
        <SessionProviderWrapper>
          <Toaster position="top-right" />
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
