import type { MetadataRoute } from "next"

import {
  listAllCourses,
  listAllUnits,
  listMostRecentYear,
} from "@/lib/db/public-queries"
import { absoluteUrl } from "@/lib/seo"

/**
 * Sitemap covers everything we want indexed:
 *   - home (planner landing)
 *   - /tree (graph explorer)
 *   - /units and /courses browse hubs
 *   - one entry per unit and per course at the latest handbook year
 *
 * Older handbook years are reachable through `?year=` query params but
 * deliberately not enumerated here — they balloon the sitemap and rank
 * worse than the canonical (latest) page for most queries.
 *
 * `lastModified` is derived from the latest handbook year (Jan 1 of
 * that year), not `new Date()`. Crawlers use lastmod as a signal for
 * which pages to re-fetch; if every entry says "just changed" every
 * build, they either re-crawl thousands of unchanged pages or stop
 * trusting the signal. Tying it to the ingest year means it only
 * changes when we ingest a new handbook, which is when the data
 * actually changed.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const year = await listMostRecentYear()
  const [units, courses] = await Promise.all([
    listAllUnits(year),
    listAllCourses(year),
  ])

  const ingestedAt = new Date(`${year}-01-01T00:00:00Z`)

  return [
    {
      url: absoluteUrl("/"),
      lastModified: ingestedAt,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/tree"),
      lastModified: ingestedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...courses.map((c): MetadataRoute.Sitemap[number] => ({
      url: absoluteUrl(`/courses/${c.code}`),
      lastModified: ingestedAt,
      changeFrequency: "yearly",
      priority: 0.6,
    })),
    ...units.map((u): MetadataRoute.Sitemap[number] => ({
      url: absoluteUrl(`/units/${u.code}`),
      lastModified: ingestedAt,
      changeFrequency: "yearly",
      priority: 0.5,
    })),
  ]
}
