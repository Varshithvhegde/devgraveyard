import type { Metadata } from "next";
import { Playfair_Display, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Providers from "@/components/layout/Providers";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevGraveyard — A Memorial for Dead Side Projects",
  description:
    "Give your abandoned passion projects a proper burial. Beautiful tombstones, AI eulogies, community mourning.",
  openGraph: {
    title: "DevGraveyard",
    description: "Where abandoned side projects go to rest in peace.",
    type: "website",
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
      className={`${playfair.variable} ${jetbrains.variable} ${inter.variable} dark`}
    >
      <body
        className="min-h-screen bg-[#050505] text-bone antialiased font-[family-name:var(--font-inter)]"
        style={{ fontFamily: "var(--font-inter), sans-serif" }}
      >
        <Providers>
          <Navbar />
          <main className="pt-14 flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
