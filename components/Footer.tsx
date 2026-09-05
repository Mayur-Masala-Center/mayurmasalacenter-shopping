interface FooterProps {
  tagline?: string;
  hours?: string;
}

const SERVICE_AREAS = [
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
];

export default function Footer({ tagline, hours }: FooterProps) {
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Mayur Masala and Pooja Center";
  const address = process.env.NEXT_PUBLIC_SHOP_ADDRESS || "Pimpri, Pune, Maharashtra";
  const phone = process.env.NEXT_PUBLIC_SHOP_PHONE || "";
  const whatsapp = process.env.NEXT_PUBLIC_SHOP_WHATSAPP || "";
  const mapsUrl =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ||
    "https://www.google.com/maps/place/Mayur+Masala+Center+and+Pooja+Bhandar/@18.6223338,73.649168,12z/data=!4m6!3m5!1s0x3bc2b9c64ee491bd:0x1b2772fad6e477e1!8m2!3d18.6223157!4d73.8015853";
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        "Namaste! I'd like to know more about your masala, pooja samagri & festival decoration items."
      )}`
    : null;

  return (
    <footer id="contact" className="bg-tamarind-900 text-cream/90 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-4">
        <div>
          <h3 className="font-display text-xl text-turmeric-300 mb-2">{shopName}</h3>
          <p className="text-sm text-cream/70">
            {tagline || "Trusted since 1992 for masala, pooja samagri & festival decoration."}
          </p>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-wide text-turmeric-300 mb-2">Visit Us</h4>
          <p className="text-sm text-cream/70">{address}</p>
          {hours && <p className="text-sm text-cream/70 mt-1">{hours}</p>}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-turmeric-300 hover:underline"
          >
            Get Directions →
          </a>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-wide text-turmeric-300 mb-2">Contact</h4>
          {phone && (
            <a href={`tel:${phone}`} className="block text-sm text-cream/70 hover:text-turmeric-300">
              {phone}
            </a>
          )}
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 text-sm text-turmeric-300 hover:underline"
            >
              Chat on WhatsApp →
            </a>
          )}
          <a
            href="/track"
            className="block mt-2 text-sm text-turmeric-300 hover:underline"
          >
            Track your order →
          </a>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-wide text-turmeric-300 mb-2">We Deliver To</h4>
          <p className="text-sm text-cream/70 leading-relaxed">{SERVICE_AREAS.join(" · ")}</p>
        </div>
      </div>
      <div className="text-center text-xs text-cream/40 pb-6 px-4">
        © {new Date().getFullYear()} {shopName}. Serving Pimpri, PCMC &amp; Pune since 1992 —
        masalas, pooja samagri and Ganpati, Gokulashtami &amp; Diwali decoration.
      </div>
    </footer>
  );
}
