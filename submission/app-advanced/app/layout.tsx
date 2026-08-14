import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
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
  title: {
    default: "AEGIS-PHARMA — Advanced Companion",
    template: "%s · AEGIS-PHARMA",
  },
  description:
    "Decision-support-only companion for GxP batch review, pharmacovigilance case intake, and supply/cold-chain recovery options. No autonomous batch disposition, PV decisions, or supply actions are ever taken.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground md:flex">
        <ThemeProvider>
          <Sidebar />
          <div className="flex min-h-full flex-1 flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <CommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
