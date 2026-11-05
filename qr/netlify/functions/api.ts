import { createLoginLimiter, handleApi } from "../../src/server/http"
import { netlifyCampaignStore } from "../../src/server/blobs-store"

const limiter = createLoginLimiter()

export default {
  fetch(request: Request) {
    return handleApi(request, {
      store: netlifyCampaignStore(),
      password: Netlify.env.get("QR_ADMIN_PASSWORD") ?? "",
      sessionSecret: Netlify.env.get("QR_SESSION_SECRET") ?? "",
      limiter,
    })
  },
  config: {
    path: "/api/*",
  },
}

declare const Netlify: { env: { get(name: string): string | undefined } }
