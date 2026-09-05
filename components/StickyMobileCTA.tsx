interface StickyMobileCTAProps {
  phone?: string;
  whatsapp?: string;
  mapsUrl: string;
}

/**
 * Sticky bottom bar shown only on mobile viewports (hidden on md+) so
 * visitors can always Call, WhatsApp, or get Directions without hunting
 * for contact info. Kept visually minimal to stay out of the way of content.
 */
export default function StickyMobileCTA({ phone, whatsapp, mapsUrl }: StickyMobileCTAProps) {
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(
        "Namaste! I'd like to know more about your masala, pooja samagri & festival decoration items."
      )}`
    : null;

  return (
    <nav
      aria-label="Quick contact"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-tamarind-900 text-cream border-t border-turmeric-500/30 grid grid-cols-3 text-xs font-semibold"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {phone ? (
        <a
          href={`tel:${phone}`}
          className="flex flex-col items-center justify-center gap-0.5 py-2.5 active:bg-tamarind-800"
          aria-label="Call the shop"
        >
          <span aria-hidden className="text-base">📞</span>
          Call
        </a>
      ) : (
        <span className="flex flex-col items-center justify-center gap-0.5 py-2.5 opacity-40">
          <span aria-hidden className="text-base">📞</span>
          Call
        </span>
      )}

      {waLink ? (
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-0.5 py-2.5 bg-vermillion-500 active:bg-vermillion-400"
          aria-label="Chat on WhatsApp"
        >
          <span aria-hidden className="text-base">💬</span>
          WhatsApp
        </a>
      ) : (
        <span className="flex flex-col items-center justify-center gap-0.5 py-2.5 opacity-40">
          <span aria-hidden className="text-base">💬</span>
          WhatsApp
        </span>
      )}

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center gap-0.5 py-2.5 active:bg-tamarind-800"
        aria-label="Get directions"
      >
        <span aria-hidden className="text-base">📍</span>
        Directions
      </a>
    </nav>
  );
}
