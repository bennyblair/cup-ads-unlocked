import { createLoginLimiter, handleNetlifyRequest } from "../../src/server/http"
import { netlifyCampaignStore } from "../../src/server/blobs-store"

const limiter = createLoginLimiter()

export default {
  fetch(request: Request) {
    // Node functions receive site secrets on process.env. Netlify.env is the
    // edge runtime API and does not see those secrets, which made login 503.
    return handleNetlifyRequest(request, netlifyCampaignStore(), limiter)
  },
  config: {
    path: "/api/*",
  },
}
