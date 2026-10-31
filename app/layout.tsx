import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header, Footer, CompareTray } from "@/components/shell";
import { ProfileProvider } from "@/components/profile-provider";
import "./globals.css";

const dmSans = localFont({ src: "../public/fonts/dm-sans.ttf", variable: "--font-dm-sans", weight: "100 1000", display: "swap" });
const lora = localFont({ src: "../public/fonts/lora-italic.ttf", variable: "--font-lora", weight: "400 700", style: "italic", display: "swap" });

export const metadata: Metadata = {
  title: { default: "AccessReady — Care that fits you", template: "%s | AccessReady" },
  description: "Find healthcare that fits your accessibility requirements. Explore transparent matches and compare synthetic facilities in the AccessReady demo.",
};
export const viewport: Viewport = { themeColor: "#153d3b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${dmSans.variable} ${lora.variable}`}><body><ProfileProvider>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <Header /><main id="main-content" tabIndex={-1}>{children}</main><Footer /><CompareTray />
  </ProfileProvider></body></html>;
}
