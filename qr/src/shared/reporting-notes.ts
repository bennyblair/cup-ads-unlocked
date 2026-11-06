export const REPORTING_NOTES = {
  visits:
    "The visit total counts every scan, including repeats. It is not a count of people.",
  uniqueness:
    "Repeat browsers are an estimate. Each campaign sets its own cookie, cs_<campaign id>, containing a random 16-character value. It lasts 30 days, stays on qr.cupspace.com.au, and is not tied to an IP address or shared across campaigns. A scan counts as a repeat only when that browser sends the same cookie back. If the cookie is missing, blocked, or expired, the scan is uniqueness unknown, not a new person. Two phones count separately. A shared phone counts as one browser. This is not a count of people.",
  history:
    "Daily totals and the repeat estimate start with scans after reporting was added. Older visits stay in the visit count. They are not rebuilt into days or treated as unique visitors.",
  automated:
    "Possible automated scans stay inside the visit total. They are labelled and are not removed to invent a human count.",
  enquiries:
    "Enquiry conversions are not connected. A redirect does not show whether someone enquired.",
  place:
    "The cafe label only names this QR code. Each cafe still needs its own code. One printed code cannot tell cafes apart.",
  timezone:
    "Days and hours use the campaign timezone selected for scans as they arrive. Changing the timezone applies to later scans. Dates already saved stay on the calendar day they were recorded.",
  country: "City is approximate. Country is kept on the scan but is not used in this report.",
} as const
