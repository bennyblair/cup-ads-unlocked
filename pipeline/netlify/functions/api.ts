import { createLoginLimiter, handleNetlifyRequest } from "../../src/server/http"

const limiter = createLoginLimiter()

export default {
  fetch(request: Request) {
    // Node functions receive site secrets on process.env. Netlify.env is the
    // edge runtime API and does not see those secrets.
    return handleNetlifyRequest(request, limiter)
  },
  config: {
    path: "/api/*",
  },
}
