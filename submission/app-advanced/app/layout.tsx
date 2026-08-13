import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GuardrailBanner } from "@/components/GuardrailBanner";
import { NavBar } from "@/components/NavBar";
import { ThemeProvider } from "@/components/theme-provider";
import { CommandPalette } from "@/components/command-palette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AEGIS-PHARMA — Advanced Companion",
  description:
    "Non-offline Next.js companion to the AEGIS-PHARMA static demonstrator. Decision-support only.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <GuardrailBanner />
          <NavBar />
          <main className="flex-1">{children}</main>
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
