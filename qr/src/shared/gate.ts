export type GateDecision =
  | { type: "next" }
  | { type: "redirect"; to: string }
  | { type: "unauthorized" }

const PUBLIC_FILES = new Set(["/favicon.svg", "/robots.txt"])

export const decideGate = ({
  method,
  pathname,
  authenticated,
}: {
  method: string
  pathname: string
  authenticated: boolean
}): GateDecision => {
  if (pathname.startsWith("/c/")) return { type: "next" }
  if (pathname.startsWith("/assets/")) return { type: "next" }
  if (PUBLIC_FILES.has(pathname)) return { type: "next" }
  if (pathname === "/api/login" && method === "POST") return { type: "next" }
  if (pathname === "/api/logout" && method === "POST") return { type: "next" }
  if (pathname === "/login") {
    return authenticated ? { type: "redirect", to: "/" } : { type: "next" }
  }
  if (pathname.startsWith("/api/")) {
    return authenticated ? { type: "next" } : { type: "unauthorized" }
  }
  if (pathname === "/" || pathname === "/index.html") {
    return authenticated ? { type: "next" } : { type: "redirect", to: "/login" }
  }
  if (!authenticated) return { type: "redirect", to: "/login" }
  return { type: "next" }
}
