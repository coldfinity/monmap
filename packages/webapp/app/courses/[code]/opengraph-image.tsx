import { ImageResponse } from "next/og"

import { fetchPublicCourse, listMostRecentYear } from "@/lib/db/public-queries"
import { loadOgAssets, OG_CONTENT_TYPE, OG_SIZE, OgShell } from "@/lib/og"

export const alt = "MonMap — course map"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

/**
 * Per-course OG card. Same shell as the unit variant — the headline
 * is the course title (e.g. "Bachelor of Computer Science"), with a
 * fact line beneath it (cp · AQF · AoS count).
 */
export default async function CourseOgImage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const upper = code.toUpperCase()
  const year = await listMostRecentYear()
  const course = await fetchPublicCourse(upper, year)
  const assets = await loadOgAssets()

  const eyebrow = course ? course.code : upper
  const title = course ? course.title : "Course not found"
  const subtitleBits = course
    ? [`${course.creditPoints} credit points`, course.school].filter(
        (s): s is string => !!s
      )
    : []
  const subtitle =
    subtitleBits.length > 0 ? subtitleBits.join(" · ") : undefined

  return new ImageResponse(
    OgShell({
      logoDataUrl: assets.logoDataUrl,
      eyebrow,
      title,
      subtitle,
      chips: [
        { label: "Course map", filled: true },
        { label: "MonMap — course mapper for Monash students" },
      ],
    }),
    {
      ...size,
      fonts: assets.fonts.map((f) => ({ ...f })),
    }
  )
}
