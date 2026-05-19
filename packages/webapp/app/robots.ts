import type { MetadataRoute } from "next"

import { isPreviewDeployment, siteUrl } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  // Preview deploys (Vercel preview env, branch deployments) should
  // never end up in Google's index — they'd compete with the canonical
  // prod URL and create duplicate-content noise.
  if (isPreviewDeployment) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    }
  }
  // /units and /courses (without a code) used to be browse hubs but
  // were removed — humans search via the workbench at /tree, Google
  // discovers entities via the sitemap which lists every /units/[code]
  // and /courses/[code] directly. No `allow` rule needed for those —
  // crawling is allowed by default; we only mention what to block.
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/api/", "/sign-in", "/plans"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
