import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import { LightboxProvider } from "@/components/LightboxContext";
import StickyMobileCTA from "@/components/StickyMobileCTA";

const SITE_URL = "https://mayurmasalacenter.in";
const SHOP_NAME = process.env.NEXT_PUBLIC_SHOP_NAME || "Mayur Masala and Pooja Center";
const SHOP_ADDRESS = process.env.NEXT_PUBLIC_SHOP_ADDRESS || "Pimpri, Pune, Maharashtra";
const SHOP_PHONE = process.env.NEXT_PUBLIC_SHOP_PHONE || "";
const SHOP_WHATSAPP = process.env.NEXT_PUBLIC_SHOP_WHATSAPP || "";
const SHOP_LAT = process.env.NEXT_PUBLIC_SHOP_LAT || "18.6223157";
const SHOP_LNG = process.env.NEXT_PUBLIC_SHOP_LNG || "73.8015853";
const GOOGLE_MAPS_URL =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ||
  "https://www.google.com/maps/place/Mayur+Masala+Center+and+Pooja+Bhandar/@18.6223338,73.649168,12z/data=!4m6!3m5!1s0x3bc2b9c64ee491bd:0x1b2772fad6e477e1!8m2!3d18.6223157!4d73.8015853";
const SHOP_INSTAGRAM = process.env.NEXT_PUBLIC_SHOP_INSTAGRAM || "";
const SHOP_FACEBOOK = process.env.NEXT_PUBLIC_SHOP_FACEBOOK || "";

const TITLE =
  "Mayur Masala & Pooja Center | Masala, Pooja Samagri & Festival Decor — Pimpri, PCMC, Pune";
const DESCRIPTION =
  "Pimpri-Chinchwad's trusted masala, pooja samagri & festival decoration store since 1992. Fresh ground masalas, complete pooja essentials, Ganpati/Gokulashtami/Diwali decor, home delivery across PCMC & Pune. Cash on delivery.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL },
  keywords: [
    "masala shop in PCMC",
    "masala shop in Pimpri",
    "masala shop in Chinchwad",
    "spices shop Pune",
    "pooja samagri shop Pimpri",
    "festival decoration items Pune",
    "Ganpati decoration items PCMC",
    "Gokulashtami decoration Pune",
    "Diwali decoration items Pimpri",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SHOP_NAME,
    type: "website",
    locale: "en_IN",
    images: [{ url: "/logo.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const areaServed = [
    "Pimpri",
    "PCMC",
    "Chinchwad",
    "Bhosari",
    "Akurdi",
    "Nigdi",
    "Moshi",
    "Wakad",
    "Ravet",
    "Tathawade",
    "Pune",
  ].map((name) => ({ "@type": "City", name }));

  const sameAs = [GOOGLE_MAPS_URL, SHOP_INSTAGRAM, SHOP_FACEBOOK].filter(Boolean);

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": ["GroceryStore", "Store"],
    "@id": `${SITE_URL}/#localbusiness`,
    name: SHOP_NAME,
    image: `${SITE_URL}/logo.png`,
    logo: `${SITE_URL}/logo.png`,
    url: SITE_URL,
    description: DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      streetAddress: SHOP_ADDRESS,
      addressLocality: "Pimpri",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SHOP_LAT,
      longitude: SHOP_LNG,
    },
    hasMap: GOOGLE_MAPS_URL,
    telephone: SHOP_PHONE || undefined,
    priceRange: "₹₹",
    foundingDate: "1992",
    areaServed,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "09:00",
      closes: "21:00",
    },
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Fresh ground masalas" } },
      { "@type": "Offer", itemOffered: { "@type": "Product", name: "Pooja samagri" } },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Product", name: "Festival decoration items (Ganpati, Gokulashtami, Diwali)" },
      },
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SHOP_NAME,
    publisher: { "@id": `${SITE_URL}/#localbusiness` },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SHOP_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    foundingDate: "1992",
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <CartProvider>
          <LightboxProvider>
            {children}
            <StickyMobileCTA phone={SHOP_PHONE} whatsapp={SHOP_WHATSAPP} mapsUrl={GOOGLE_MAPS_URL} />
          </LightboxProvider>
        </CartProvider>
      </body>
    </html>
  );
}
