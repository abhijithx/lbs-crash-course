import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://lbscourse.cetmca.in";
  
  const routes: { path: string; priority: number; changefreq: "daily" | "weekly" | "monthly" }[] = [
    { path: "/", priority: 1.0, changefreq: "daily" },
    { path: "/login", priority: 0.9, changefreq: "weekly" },
    { path: "/register", priority: 0.9, changefreq: "weekly" },
    { path: "/privacy-policy", priority: 0.8, changefreq: "monthly" },
    { path: "/terms-of-service", priority: 0.8, changefreq: "monthly" },
    { path: "/contact", priority: 0.8, changefreq: "weekly" },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));
}