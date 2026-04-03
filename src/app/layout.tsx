import type { Metadata } from "next";
import { Outfit, Cormorant_Garamond } from "next/font/google";
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
      <body className={`${outfit.variable} ${cormorant.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
