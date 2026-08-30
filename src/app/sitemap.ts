import { MetadataRoute } from "next";
import phoneData from "@/data/phoneModels.json";
import { ARTICLES } from "@/lib/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.smartcaremobile.in";
  
  // Stable release timestamp for static platform pages
  const staticReleaseDate = new Date("2026-08-01T00:00:00.000Z").toISOString();

  // Core Static & Service Landing Pages
  const routes = [
    "",
    "/mobile-repair-gurugram",
    "/iphone-repair-gurugram",
    "/samsung-repair-gurugram",
    "/screen-replacement-gurugram",
    "/battery-replacement-gurugram",
    "/charging-port-repair-gurugram",
    "/print-xerox-services-gurugram",
    "/pickup",
    "/accessories",
    "/corporate-orders",
    "/blog",
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

  const allUrls: MetadataRoute.Sitemap = [
    ...routes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: staticReleaseDate,
      changeFrequency: (route === "" ? "daily" : "weekly") as "daily" | "weekly",
      priority: route === "" ? 1.0 : route.includes("repair") || route.includes("replacement") ? 0.9 : 0.8,
    })),
    ...brandRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: staticReleaseDate,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    ...modelRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: staticReleaseDate,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    ...ARTICLES.map((article) => {
      let articleIsoDate = staticReleaseDate;
      try {
        if (article.date) {
          const parsed = new Date(article.date);
          if (!isNaN(parsed.getTime())) {
            articleIsoDate = parsed.toISOString();
          }
        }
      } catch (e) {}
      return {
        url: `${baseUrl}/blog/${article.slug}`,
        lastModified: articleIsoDate,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      };
    }),
  ];

  return allUrls;
}
