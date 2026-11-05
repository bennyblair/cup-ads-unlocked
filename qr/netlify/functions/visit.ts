import { netlifyCampaignStore } from "../../src/server/blobs-store"
import { handleVisit } from "../../src/server/http"

export default {
  fetch(request: Request) {
    return handleVisit(request, netlifyCampaignStore())
  },
  config: {
    path: "/c/:id",
  },
}
