import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import GoogleReviews from "@/components/GoogleReviews";
import { getActiveProducts, getSiteSettings, getFeaturedReviews } from "@/lib/data";
import { slugify } from "@/lib/slug";

export const revalidate = 30;

const SITE_URL = "https://mayurmasalacenter.in";

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

const FESTIVALS = [
  {
    name: "Ganpati / Ganesh Chaturthi",
    blurb:
      "Ganpati decoration items, makhar/thermocol backdrops, modak-making essentials, aarti samagri and traditional pooja items for Ganesh Chaturthi.",
  },
  {
    name: "Gokulashtami / Janmashtami",
    blurb:
      "Dahi handi and Krishna janmashtami decoration items, jhula (cradle) decor, and pooja samagri for Gokulashtami celebrations.",
  },
  {
    name: "Diwali",
    blurb:
      "Diwali decoration items, diyas, rangoli materials, torans and complete Lakshmi pooja samagri for a bright, traditional Diwali.",
  },
];

const FAQS = [
  {
    q: "Do you deliver masala and pooja samagri across PCMC and Pune?",
    a: "Yes, we deliver across Pimpri, Chinchwad, Bhosari, Akurdi, Nigdi, Moshi, Wakad, Ravet, Tathawade and greater Pune, with cash on delivery available.",
  },
  {
    q: "Do you sell festival decoration items for Ganpati, Gokulashtami and Diwali?",
    a: "Yes, alongside our masalas and pooja samagri we stock festival decoration items for Ganpati, Gokulashtami/Janmashtami, Diwali and other Indian festivals.",
  },
  {
    q: "Are your masalas freshly ground?",
    a: "Yes, our masalas are ground fresh and packed to order — we've followed the same process since 1992.",
  },
  {
    q: "Can I order on WhatsApp or by phone?",
    a: "Yes, you can call us or message us on WhatsApp directly to place an enquiry or order — look for the Call and WhatsApp buttons on this page.",
  },
];

export default async function HomePage() {
  const [products, settings, reviews] = await Promise.all([
    getActiveProducts(),
    getSiteSettings(),
    getFeaturedReviews(),
  ]);

  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Mayur Masala and Pooja Center";

  const categories = Array.from(
    new Set(products.map((p) => p.category || "General"))
  );

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <Header />
      <Banner {...settings.banner} />
      <CartDrawer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* HERO */}
      <section className="relative overflow-hidden bg-diya-glow bg-tamarind-900 text-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-turmeric-300 border border-turmeric-300/40 rounded-full px-3 py-1 mb-5">
              Est. 1992 · Pimpri, PCMC
            </span>
            <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-5">
              Pure Masalas, Pooja Samagri &amp; Festival Decor.
              <span className="block text-turmeric-300">
                Serving Pimpri, PCMC &amp; Pune since 1992.
              </span>
            </h1>
            <p className="text-cream/80 text-base sm:text-lg mb-8 max-w-md">
              Ground fresh, packed with trust — for over three decades {shopName}
              has served your kitchen, your puja ghar and every festival — Ganpati,
              Gokulashtami, Diwali and more — for families across Pimpri, Chinchwad,
              Bhosari, Akurdi, Nigdi, Wakad, Ravet and Pune.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#shop"
                className="bg-vermillion-500 hover:bg-vermillion-400 transition-colors text-cream font-semibold px-6 py-3 rounded-full"
              >
                Shop Now
              </a>
              <a
                href="#festivals"
                className="border border-cream/30 hover:border-turmeric-300 transition-colors px-6 py-3 rounded-full font-semibold"
              >
                Festival Decor
              </a>
              <a
                href="#about"
                className="border border-cream/30 hover:border-turmeric-300 transition-colors px-6 py-3 rounded-full font-semibold"
              >
                Our Story
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP */}
      <section id="shop" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-8">
          <h2 className="font-display text-3xl text-tamarind-900 mb-2">Shop Our Range</h2>
          <p className="text-tamarind-800/70 max-w-2xl">
            Fresh masalas, complete pooja samagri and festival decoration items —
            everything you need, delivered across Pimpri, PCMC and Pune.
          </p>
        </div>

        {products.length === 0 ? (
          <p className="text-tamarind-800/60 text-center py-20">
            Products coming soon. Please check back shortly, or contact the shop directly.
          </p>
        ) : (
          categories.map((cat) => {
            const items = products.filter((p) => (p.category || "General") === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="mb-12">
                <a href={`/category/${slugify(cat)}`} className="group inline-flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-vermillion-500 capitalize group-hover:underline">
                    {cat}
                  </h3>
                  <span className="text-xs text-vermillion-500/70">View all →</span>
                </a>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      {/* FESTIVAL DECOR */}
      <section id="festivals" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-8">
          <h2 className="font-display text-3xl text-tamarind-900 mb-2">
            Festival Decoration &amp; Pooja Samagri
          </h2>
          <p className="text-tamarind-800/70 max-w-2xl">
            From Ganpati to Gokulashtami to Diwali, {shopName} stocks decoration items
            and complete pooja samagri for every major Indian festival — trusted by
            families across Pimpri, PCMC and Pune.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {FESTIVALS.map((f) => (
            <div
              key={f.name}
              className="bg-white/70 border border-turmeric-300/40 rounded-2xl p-5"
            >
              <h3 className="font-semibold text-vermillion-500 mb-2">{f.name}</h3>
              <p className="text-sm text-tamarind-800/70 leading-relaxed">{f.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-turmeric-50 border-y border-turmeric-300/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-display text-3xl text-tamarind-900 mb-6">
            {settings.about.title}
          </h2>
          <p className="text-tamarind-800/80 leading-relaxed whitespace-pre-line">
            {settings.about.body}
          </p>
        </div>
      </section>

      {/* AREAS SERVED */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display text-3xl text-tamarind-900 mb-3 text-center">
          Areas We Deliver To
        </h2>
        <p className="text-tamarind-800/70 text-center max-w-2xl mx-auto mb-8">
          {shopName} delivers fresh masalas, pooja samagri and festival decoration
          items across PCMC and Pune, including:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {SERVICE_AREAS.map((area) => (
            <span
              key={area}
              className="text-sm font-medium text-tamarind-900/80 bg-turmeric-50 border border-turmeric-300/40 rounded-full px-4 py-1.5"
            >
              {area}
            </span>
          ))}
        </div>
      </section>

      <GoogleReviews reviews={reviews} />

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display text-3xl text-tamarind-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group bg-white/70 border border-turmeric-300/40 rounded-xl p-4"
            >
              <summary className="font-semibold text-tamarind-900 cursor-pointer list-none flex items-center justify-between gap-4">
                {f.q}
                <span aria-hidden className="text-vermillion-500 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="text-sm text-tamarind-800/70 mt-2 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer tagline={settings.footer.tagline} hours={settings.footer.hours} />
    </>
  );
}
