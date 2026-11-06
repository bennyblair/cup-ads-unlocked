export const suggestedDestination = (destination: string, campaignName: string) => {
  let url: URL
  try {
    url = new URL(destination)
  } catch {
    return null
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null
  const slug =
    campaignName
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "qr"
  if (!url.searchParams.has("utm_source")) url.searchParams.set("utm_source", "cupspace")
  if (!url.searchParams.has("utm_medium")) url.searchParams.set("utm_medium", "qr")
  if (!url.searchParams.has("utm_campaign")) url.searchParams.set("utm_campaign", slug)
  return url.toString()
}
