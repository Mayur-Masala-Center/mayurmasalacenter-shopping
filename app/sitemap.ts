import type { MetadataRoute } from "next";
import { getActiveCategories } from "@/lib/data";
import { slugify } from "@/lib/slug";

const SITE_URL = "https://mayurmasalacenter.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getActiveCategories();

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/category/${slugify(c)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/track`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...categoryEntries,
  ];
}
