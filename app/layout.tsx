import type { Metadata } from "next";
import Script from "next/script";
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
  title: "Patas & Passos — Dog Walker, Pet Sitter, Creche, Hotel e Vacinas a Domicílio",
  description:
    "Mais do que um passeio, uma jornada de bem-estar para o seu pet. Dog walker, socialização, pet sitter, creche, hotel e vacinas a domicílio em São Caetano do Sul e Santo André — SP.",
  keywords: [
    "cuidado pet São Caetano do Sul",
    "dog walker Santo André",
    "creche para cães",
    "hotel para pets",
    "pet sitter",
    "vacina a domicílio",
    "Patas & Passos",
  ],
  openGraph: {
    title: "Patas & Passos — Cuidado Pet em São Caetano do Sul e Santo André",
    description:
      "Dog walker, socialização, pet sitter, creche, hotel e vacinas a domicílio com amor e segurança.",
    locale: "pt_BR",
    type: "website",
  },
  icons: { icon: "/mascot/logo-face.png" },
};

const GTM_ID = "GTM-MCCHLJ6Q";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${heading.variable} ${body.variable}`}>
      <body>
        <Script
          id="gtm-base"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
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
