import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://lbscourse.cetmca.in";
  
  const routes: { path: string; priority: number; changefreq: "daily" | "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1.0, changefreq: "daily" },
    { path: "/login", priority: 0.8, changefreq: "monthly" },
    { path: "/register", priority: 0.9, changefreq: "weekly" },
    { path: "/privacy-policy", priority: 0.3, changefreq: "yearly" },
    { path: "/terms-of-service", priority: 0.3, changefreq: "yearly" },
    { path: "/contact", priority: 0.7, changefreq: "monthly" },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));
}