import type { Metadata } from "next";
import { Outfit, Cormorant_Garamond, Playfair_Display, Inter, Space_Grotesk, DM_Serif_Display, Caveat } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  weight: ["400", "500", "600", "700"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dmserif",
  weight: ["400"],
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Eternizar — Homenagens digitais que emocionam",
  description: "Transforme memórias em páginas inesquecíveis. Crie homenagens digitais com música, fotos e sua história. Para casais, formaturas e todas as celebrações.",
  openGraph: {
    title: "Eternizar — Homenagens digitais que emocionam",
    description: "Transforme memórias em páginas inesquecíveis com música, fotos e sua história.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className={`${outfit.variable} ${cormorant.variable} ${playfair.variable} ${inter.variable} ${spaceGrotesk.variable} ${dmSerif.variable} ${caveat.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
