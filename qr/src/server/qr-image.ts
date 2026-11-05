import QRCode from "qrcode"

import { trackingUrl } from "../shared/campaign"

const QR_OPTIONS = {
  errorCorrectionLevel: "H" as const,
  margin: 4,
  color: {
    dark: "#000000",
    light: "#ffffff",
  },
}

export const qrSvg = (id: string) =>
  QRCode.toString(trackingUrl(id), {
    ...QR_OPTIONS,
    type: "svg",
  })

export const qrPng = (id: string) =>
  QRCode.toBuffer(trackingUrl(id), {
    ...QR_OPTIONS,
    type: "png",
    width: 2048,
  })
