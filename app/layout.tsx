import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import SocialDock from "@/components/SocialDock";
import RevealInit from "@/components/RevealInit";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
  display: "swap",
});
const body = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Patas & Passos — Dog Walker, Pet Sitter, Hotel e Vacinas a domicílio",
  description:
    "Mais do que um passeio, uma jornada de bem-estar para o seu pet. Dog walker, pet sitter, hotel e vacinas a domicílio em São Caetano e Santo André.",
  icons: { icon: "/mascot/logo-face.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${heading.variable} ${body.variable}`}>
      <body>
        <TopBar />
        {children}
        <div className="wrap"><ContactForm /></div>
        <Footer />
        <SocialDock />
        <RevealInit />
      </body>
    </html>
  );
}
