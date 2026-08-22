import { MetadataRoute } from "next";
import phoneData from "@/data/phoneModels.json";
import { ARTICLES } from "@/lib/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://smartcaremobile.in";
  const currentDate = new Date().toISOString();

  // Core Static Pages
  const routes = [
    "",
    "/mobile-repair-gurugram",
    "/iphone-repair-gurugram",
    "/samsung-repair-gurugram",
    "/screen-replacement-gurugram",
    "/pickup",
    "/accessories",
    "/corporate-orders",
    "/blog",
    "/mobile-assistant",
    "/privacy",
    "/terms",
    "/sitemap",
  ];

  // Dynamically generate all Brand Routes from phoneData
  const brandRoutes = phoneData.brands.map((brand) => `/accessories/brand/${brand.toLowerCase()}`);

  // Dynamically generate Model Routes from phoneData
  const modelRoutes: string[] = [];
  Object.entries(phoneData.brandModels).forEach(([brand, models]) => {
    const brandLower = brand.toLowerCase();
    (models as Array<{ name: string }>).forEach((m) => {
      const modelSlug = m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (modelSlug) {
        modelRoutes.push(`/accessories/brand/${brandLower}/${modelSlug}`);
      }
    });
  });

  // Dynamically generate all Blog Routes from ARTICLES
  const blogRoutes = ARTICLES.map((article) => `/blog/${article.slug}`);

  const allUrls: MetadataRoute.Sitemap = [
    ...routes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: currentDate,
      changeFrequency: (route === "" ? "daily" : "weekly") as "daily" | "weekly",
      priority: route === "" ? 1.0 : route.includes("repair") ? 0.9 : 0.8,
    })),
    ...brandRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...modelRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...blogRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  return allUrls;
}
