import { MetadataRoute } from "next";

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
    "/repair",
    "/mobile-assistant",
    "/accessories",
    "/corporate-bulk-orders",
    "/blog",
    "/privacy",
    "/terms",
    "/sitemap",
  ];

  // Brand Accessories Pages
  const brandRoutes = [
    "/accessories/brand/apple",
    "/accessories/brand/samsung",
    "/accessories/brand/oneplus",
    "/accessories/brand/vivo",
    "/accessories/brand/oppo",
    "/accessories/brand/xiaomi",
    "/accessories/brand/realme",
    "/accessories/brand/google",
  ];

  // Model-Specific Accessories Pages
  const modelRoutes = [
    "/accessories/brand/apple/iphone-15",
    "/accessories/brand/apple/iphone-15-pro",
    "/accessories/brand/apple/iphone-15-pro-max",
    "/accessories/brand/apple/iphone-14",
    "/accessories/brand/samsung/galaxy-s24-ultra",
    "/accessories/brand/samsung/galaxy-s23-5g",
    "/accessories/brand/oneplus/oneplus-12",
  ];

  // Blog Guides
  const blogRoutes = [
    "/blog/iphone-screen-replacement-cost-gurgaon",
    "/blog/when-to-replace-phone-battery",
    "/blog/why-is-phone-charging-slowly",
    "/blog/why-smartphone-overheating-causes",
    "/blog/how-to-choose-right-phone-charger",
    "/blog/how-to-choose-tempered-glass-screen-protector",
  ];

  const allUrls = [
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
      priority: 0.8,
    })),
    ...modelRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...blogRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];

  return allUrls;
}
