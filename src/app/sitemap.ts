import type { MetadataRoute } from "next";
import { cacheLife } from "next/cache";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  "use cache";
  cacheLife("days");

  const staticRoutes = [
    "",
    "/work",
    "/pricing",
    "/about",
    "/blog",
    "/faq",
    "/contact",
  ];

  return staticRoutes.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
