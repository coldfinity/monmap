/**
 * Shared shell for OG images. The home page, /units/[code], and
 * /courses/[code] all render social-share cards on the same gradient
 * background with the same brand bug — only the headline text and the
 * subtitle change. Centralising here keeps the three callers identical
 * so a logo / colour tweak lands everywhere at once.
 *
 * Returns a `ReactElement` plus the font byte arrays — the calling
 * route is expected to wrap with `new ImageResponse(...)` so the
 * caller can also set `alt`, `size`, etc. on a per-route basis.
 */
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type { ReactElement } from "react"

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"

const MONASH_YELLOW = "#ffe330"
const MONASH_YELLOW_INK = "#1d1300"

async function loadGoogleFont(family: string, weight: number) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:wght@${weight}`
  const css = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  }).then((r) => r.text())
  const fontUrl = css.match(/src: url\((https:[^)]+)\) format/)?.[1]
  if (!fontUrl) throw new Error(`Could not resolve ${family} ${weight}`)
  return fetch(fontUrl).then((r) => r.arrayBuffer())
}

export async function loadOgAssets() {
  const [logoBytes, poppinsRegular, poppinsBold, poppinsBlack] =
    await Promise.all([
      readFile(join(process.cwd(), "public/brand-logo.png")),
      loadGoogleFont("Poppins", 500),
      loadGoogleFont("Poppins", 700),
      loadGoogleFont("Poppins", 900),
    ])
  return {
    logoDataUrl: `data:image/png;base64,${logoBytes.toString("base64")}`,
    fonts: [
      { name: "Poppins", data: poppinsRegular, weight: 500, style: "normal" },
      { name: "Poppins", data: poppinsBold, weight: 700, style: "normal" },
      { name: "Poppins", data: poppinsBlack, weight: 900, style: "normal" },
    ] as const,
  }
}

/**
 * Headline font size by character count. Step-down is graduated because
 * a fixed pair (104 / 80) cliffs around 36 chars: titles like "Bachelor
 * of Computer Science" (28) still wrap at 104, and longer titles like
 * "Master of Banking and Finance" (29) get crammed. These tiers keep
 * common entity titles fitting on roughly two lines without dominating
 * the card.
 */
function titleFontSize(title: string): number {
  const n = title.length
  if (n <= 16) return 124
  if (n <= 24) return 104
  if (n <= 34) return 88
  if (n <= 48) return 72
  if (n <= 64) return 60
  return 52
}

export interface OgShellProps {
  logoDataUrl: string
  /** Tiny line above the headline, e.g. "FIT2004 · Unit". */
  eyebrow?: string
  /** Headline — usually the unit/course title. */
  title: string
  /** Optional small subtitle below the headline. */
  subtitle?: string
  /** Bottom-row chips. Pass [] to skip. */
  chips?: ReadonlyArray<{ label: string; filled?: boolean }>
}

/**
 * The OG card. Layout:
 *
 *   ┌─────────────────────────────────┐
 *   │ ⬡ MAC                           │  brand block
 *   │   monmap.monashcoding.com       │
 *   │                                 │
 *   │   FIT2004 · Unit                │  eyebrow (small)
 *   │   Algorithms and data           │  headline (huge)
 *   │   structures                    │
 *   │   6 cp · Level 2 · FIT          │  subtitle
 *   │                                 │
 *   │  [Prereq map] [Course planner]  │  chips
 *   └─────────────────────────────────┘
 */
export function OgShell({
  logoDataUrl,
  eyebrow,
  title,
  subtitle,
  chips,
}: OgShellProps): ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#0e0820",
        color: "#ffffff",
        fontFamily: "Poppins",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -260,
          right: -260,
          width: 920,
          height: 920,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(91,45,144,0.55) 0%, rgba(91,45,144,0.18) 35%, rgba(91,45,144,0) 70%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -240,
          left: -200,
          width: 760,
          height: 760,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(122,63,192,0.45) 0%, rgba(122,63,192,0.15) 35%, rgba(122,63,192,0) 70%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          padding: "64px 72px",
          gap: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* next/og's ImageResponse renders via Satori, which only
              speaks raw <img> — next/image isn't usable here.
              eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoDataUrl}
            width={64}
            height={64}
            style={{ borderRadius: 16 }}
            alt=""
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontWeight: 500,
            }}
          >
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.65)" }}>
              Monash Association of Coding
            </div>
            <div
              style={{
                fontSize: 18,
                color: MONASH_YELLOW,
                fontWeight: 700,
                marginTop: 2,
              }}
            >
              monmap.monashcoding.com
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {eyebrow ? (
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: MONASH_YELLOW,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              fontSize: titleFontSize(title),
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.04,
              maxWidth: 1060,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 28,
                fontWeight: 500,
                color: "rgba(255,255,255,0.78)",
                marginTop: 20,
                maxWidth: 1000,
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {chips && chips.length > 0 ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {chips.map((c) => (
              <div
                key={c.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 22px",
                  borderRadius: 999,
                  fontSize: 20,
                  fontWeight: 700,
                  background: c.filled
                    ? MONASH_YELLOW
                    : "rgba(255,255,255,0.08)",
                  color: c.filled
                    ? MONASH_YELLOW_INK
                    : "rgba(255,255,255,0.92)",
                  border: c.filled
                    ? `2px solid ${MONASH_YELLOW}`
                    : "2px solid rgba(255,255,255,0.18)",
                }}
              >
                {c.label}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
