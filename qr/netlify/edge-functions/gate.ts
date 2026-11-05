import { decideGate } from "../../src/shared/gate"
import { hasValidSession } from "../../src/shared/session"

declare const Netlify: { env: { get(name: string): string | undefined } }

type EdgeContext = { next: () => Promise<Response> | Response }

const redirect = (request: Request, to: string) =>
  new Response(null, {
    status: 302,
    headers: {
      Location: new URL(to, request.url).toString(),
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  })

export default async (request: Request, context: EdgeContext) => {
  const pathname = new URL(request.url).pathname
  try {
    const secret = Netlify.env.get("QR_SESSION_SECRET") ?? ""
    const password = Netlify.env.get("QR_ADMIN_PASSWORD") ?? ""
    const authenticated = await hasValidSession(request, secret, password)
    const decision = decideGate({ method: request.method, pathname, authenticated })
    if (decision.type === "redirect") return redirect(request, decision.to)
    if (decision.type === "unauthorized") {
      return new Response(JSON.stringify({ error: "Sign in required." }), {
        status: 401,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      })
    }
    return context.next()
  } catch {
    console.error("qr gate failed")
    if (pathname.startsWith("/c/")) return context.next()
    return redirect(request, "/login")
  }
}
