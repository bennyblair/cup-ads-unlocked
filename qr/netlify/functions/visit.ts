import { netlifyAnalyticsStore } from "../../src/server/analytics-store"
import { netlifyCampaignStore } from "../../src/server/blobs-store"
import { handleVisit } from "../../src/server/http"

export default {
  fetch(request: Request) {
    return handleVisit(request, netlifyCampaignStore(), netlifyAnalyticsStore())
  },
  config: {
    path: "/c/:id",
  },
}
