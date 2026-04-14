import type { Metadata, Viewport } from "next";
import { Outfit, Cormorant_Garamond, Playfair_Display, Inter, Space_Grotesk, Caveat } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700", "900"],
  display: "swap",
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#08080c",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://eternizar.io"),
  title: {
    default: "Eternizar — Homenagens digitais que emocionam",
    template: "%s | Eternizar",
  },
  description: "Transforme memórias em páginas inesquecíveis. Crie homenagens digitais com música, fotos e sua história. Para casais, formaturas e todas as celebrações.",
  openGraph: {
    title: "Eternizar — Homenagens digitais que emocionam",
    description: "Transforme memórias em páginas inesquecíveis com música, fotos e sua história.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className={`${outfit.variable} ${cormorant.variable} ${playfair.variable} ${inter.variable} ${spaceGrotesk.variable} ${caveat.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
