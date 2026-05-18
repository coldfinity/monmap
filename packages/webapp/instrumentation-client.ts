import posthog from "posthog-js"

// Skip PostHog in dev. Keeps localhost out of prod analytics, and
// avoids the "could not load recorder" / "failed to fetch" noise
// when an ad blocker swallows the lazy-loaded recorder script.
if (process.env.NODE_ENV === "production") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
  })
}
