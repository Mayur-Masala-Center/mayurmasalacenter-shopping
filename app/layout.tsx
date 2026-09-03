import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import { LightboxProvider } from "@/components/LightboxContext";

const SITE_URL = "https://mayurmasalacenter.in";
const SHOP_NAME = process.env.NEXT_PUBLIC_SHOP_NAME || "Mayur Masala and Pooja Center";
const SHOP_ADDRESS = process.env.NEXT_PUBLIC_SHOP_ADDRESS || "Pimpri, Pune, Maharashtra";
const SHOP_PHONE = process.env.NEXT_PUBLIC_SHOP_PHONE || "";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Mayur Masala and Pooja Center | Pimpri's Oldest Since 1992",
  description:
    "Mayur Masala and Pooja Center — Pimpri's trusted masala and pooja samagri store since 1992. Fresh ground masalas, complete pooja essentials, home delivery, cash on delivery.",
  openGraph: {
    title: "Mayur Masala and Pooja Center | Pimpri's Oldest Since 1992",
    description:
      "Pimpri's trusted masala and pooja samagri store since 1992. Fresh ground masalas, complete pooja essentials, home delivery, cash on delivery.",
    url: SITE_URL,
    siteName: SHOP_NAME,
    type: "website",
    locale: "en_IN",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mayur Masala and Pooja Center | Pimpri's Oldest Since 1992",
    description:
      "Pimpri's trusted masala and pooja samagri store since 1992. Fresh ground masalas, complete pooja essentials, home delivery, cash on delivery.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: SHOP_NAME,
    image: `${SITE_URL}/logo.png`,
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: SHOP_ADDRESS,
      addressLocality: "Pimpri",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    telephone: SHOP_PHONE || undefined,
    priceRange: "₹₹",
    foundingDate: "1992",
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body>
        <CartProvider>
          <LightboxProvider>{children}</LightboxProvider>
        </CartProvider>
      </body>
    </html>
  );
}
