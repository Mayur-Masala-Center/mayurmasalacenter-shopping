import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import { getActiveProducts, getSiteSettings } from "@/lib/data";
import { slugify } from "@/lib/slug";

export const revalidate = 30;

const SITE_URL = "https://mayurmasalacenter.in";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategoryData(slug: string) {
  const products = await getActiveProducts();
  const categories = Array.from(new Set(products.map((p) => p.category || "General")));
  const category = categories.find((c) => slugify(c) === slug);
  if (!category) return null;
  const items = products.filter((p) => (p.category || "General") === category);
  return { category, items, allCategories: categories };
}

export async function generateStaticParams() {
  const products = await getActiveProducts();
  const categories = Array.from(new Set(products.map((p) => p.category || "General")));
  return categories.map((c) => ({ slug: slugify(c) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  if (!data) return {};

  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Mayur Masala and Pooja Center";
  const title = `${data.category} | ${shopName}, Pimpri`;
  const description = `Shop ${data.category} at ${shopName} — Pimpri's trusted masala and pooja samagri store since 1992. Fresh stock, home delivery, cash on delivery.`;
  const url = `${SITE_URL}/category/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: shopName,
      type: "website",
      images: data.items[0]?.image_url ? [{ url: data.items[0].image_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getCategoryData(slug);
  if (!data) notFound();

  const settings = await getSiteSettings();
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || "Mayur Masala and Pooja Center";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${data.category} | ${shopName}`,
    url: `${SITE_URL}/category/${slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: data.items.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Product",
          name: p.name,
          image: p.image_url || undefined,
          description: p.description || undefined,
          offers: {
            "@type": "Offer",
            price: p.price,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
          },
        },
      })),
    },
  };

  return (
    <>
      <Header />
      <Banner {...settings.banner} />
      <CartDrawer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <nav className="text-xs text-tamarind-800/50 mb-4">
          <a href="/" className="hover:underline">
            Home
          </a>{" "}
          / <span className="text-tamarind-900">{data.category}</span>
        </nav>

        <h1 className="font-display text-3xl text-tamarind-900 mb-2 capitalize">
          {data.category}
        </h1>
        <p className="text-tamarind-800/70 text-sm mb-8 max-w-2xl">
          Browse our {data.category.toLowerCase()} range at {shopName}, Pimpri&apos;s trusted
          masala and pooja samagri store since 1992.
        </p>

        {data.allCategories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {data.allCategories.map((c) => {
              const cSlug = slugify(c);
              const active = cSlug === slug;
              return (
                <a
                  key={c}
                  href={`/category/${cSlug}`}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-vermillion-500 text-cream border-vermillion-500"
                      : "border-tamarind-900/20 text-tamarind-900/70 hover:border-vermillion-500"
                  }`}
                >
                  {c}
                </a>
              );
            })}
          </div>
        )}

        {data.items.length === 0 ? (
          <p className="text-tamarind-800/60 text-center py-20">
            No products in this category right now. Please check back shortly.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <Footer tagline={settings.footer.tagline} hours={settings.footer.hours} />
    </>
  );
}
