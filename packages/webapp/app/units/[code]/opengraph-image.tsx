import { ImageResponse } from "next/og"

import { fetchPublicUnit, listMostRecentYear } from "@/lib/db/public-queries"
import { loadOgAssets, OG_CONTENT_TYPE, OG_SIZE, OgShell } from "@/lib/og"

export const alt = "MonMap — unit prereq map"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
// Cache each generated card on the CDN for 7 days (mirrors the page's
// ISR window). Combined with self-hosted fonts (see lib/og.tsx), this
// keeps the route static so crawler/social re-hits serve the cached PNG
// instead of re-rendering on the origin. Tag-based invalidation via
// /api/revalidate-handbook is the primary freshness mechanism.
export const revalidate = 604800

// Lazy ISR, same policy as the matching /units/[code] page: returning
// [] prebuilds nothing (avoids 40k build-time renders) but the empty
// `generateStaticParams` export is what flips Next from on-demand
// dynamic (ƒ) to cached-on-first-hit ISR (●). Without it the card
// re-renders on the origin every request — the whole point of this fix.
export function generateStaticParams() {
  return []
}

/**
 * Per-unit OG card. Discord / Reddit / Slack unfurl /units/FIT2004 to
 * show the unit code, title and a short fact line — not the generic
 * home image. Drives social click-through on share posts.
 */
export default async function UnitOgImage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const upper = code.toUpperCase()
  const year = await listMostRecentYear()
  const unit = await fetchPublicUnit(upper, year)
  const assets = await loadOgAssets()

  const eyebrow = unit ? unit.code : upper
  const title = unit ? unit.title : `Unit not found`
  // `units.level` already comes through as a human-readable "Level 2"
  // string (the CourseLoop lite-reference's `.label`). Don't prefix
  // another "Level " — that produces "Level Level 2".
  const subtitleBits = unit
    ? [`${unit.creditPoints} credit points`, unit.school].filter(
        (s): s is string => !!s
      )
    : []
  const subtitle =
    subtitleBits.length > 0 ? subtitleBits.join(" · ") : undefined

  // Chips brand the *product*, not the entity. A viewer in Discord
  // doesn't care that FIT2004 has 5 prereqs from the share card — they
  // want to know what MonMap is and why they'd click. Stats live on
  // the page itself.
  const chips: Array<{ label: string; filled?: boolean }> = [
    { label: "Prereq map", filled: true },
    { label: "MonMap — course mapper for Monash students" },
  ]

  return new ImageResponse(
    OgShell({
      logoDataUrl: assets.logoDataUrl,
      eyebrow,
      title,
      subtitle,
      chips,
    }),
    {
      ...size,
      fonts: assets.fonts.map((f) => ({ ...f })),
    }
  )
}
