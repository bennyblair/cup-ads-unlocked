import type { AustralianState } from "../data/locations"
import type { CafeApplicationRecord, CafePrivateDetails } from "../types/cafes"

const australianStates = new Set<AustralianState>([
  "ACT",
  "NSW",
  "NT",
  "QLD",
  "SA",
  "TAS",
  "VIC",
  "WA",
])

const readRequired = (
  data: Record<string, string>,
  key: string,
  maxLength = 180,
) => {
  const value = data[key]?.trim()
  if (!value) {
    throw new Error(`Missing required café field: ${key}`)
  }

  return value.slice(0, maxLength)
}

const readOptional = (
  data: Record<string, string>,
  key: string,
  maxLength = 500,
) => data[key]?.trim().slice(0, maxLength) ?? ""

const coordinateIsInAustralia = (longitude: number, latitude: number) =>
  longitude >= 112 &&
  longitude <= 154.5 &&
  latitude >= -44.5 &&
  latitude <= -9.5

const hashString = (value: string) => {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const createApproximateCoordinates = (
  id: string,
  exactCoordinates: [longitude: number, latitude: number],
): [longitude: number, latitude: number] => {
  const hash = hashString(`${id}:${exactCoordinates.join(":")}`)
  const angle = ((hash % 360) * Math.PI) / 180
  const distanceMetres = 220 + (hash % 181)
  const [longitude, latitude] = exactCoordinates
  const latitudeOffset =
    (Math.sin(angle) * distanceMetres) / 111_320
  const longitudeOffset =
    (Math.cos(angle) * distanceMetres) /
    (111_320 * Math.max(Math.cos((latitude * Math.PI) / 180), 0.2))

  return [
    Number((longitude + longitudeOffset).toFixed(5)),
    Number((latitude + latitudeOffset).toFixed(5)),
  ]
}

export const buildCafeApplicationRecord = ({
  id,
  createdAt,
  data,
}: {
  id: string
  createdAt: string
  data: Record<string, string>
}): CafeApplicationRecord => {
  const longitudeValue = readOptional(data, "exactLongitude", 24)
  const latitudeValue = readOptional(data, "exactLatitude", 24)
  const hasLegacyCoordinates = Boolean(longitudeValue && latitudeValue)
  const longitude = Number(longitudeValue)
  const latitude = Number(latitudeValue)

  if (
    (longitudeValue || latitudeValue) &&
    (!hasLegacyCoordinates ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      !coordinateIsInAustralia(longitude, latitude))
  ) {
    throw new Error("The café pin must be placed within Australia.")
  }

  const state = readRequired(data, "state", 3).toUpperCase() as AustralianState
  if (!australianStates.has(state)) {
    throw new Error("Invalid Australian state or territory.")
  }

  const postcode = readRequired(data, "postcode", 4)
  if (!/^\d{4}$/.test(postcode)) {
    throw new Error("Invalid Australian postcode.")
  }

  const consent = readOptional(data, "publicListingConsent", 40)
  if (consent && !["anonymous-map", "yes"].includes(consent)) {
    throw new Error("Invalid anonymous public map consent value.")
  }

  const suburb = readRequired(data, "suburb", 90)
  const exactCoordinates: [number, number] | undefined = hasLegacyCoordinates
    ? [longitude, latitude]
    : undefined

  const privateDetails: CafePrivateDetails = {
    firstName: readRequired(data, "firstName", 80),
    lastName: readRequired(data, "lastName", 80),
    email: readRequired(data, "email", 180),
    phone: readRequired(data, "phone", 60),
    cafeName: readRequired(data, "cafeName", 160),
    role: readOptional(data, "role", 80),
    address: readRequired(data, "address", 220),
    suburb,
    state,
    postcode,
    exactCoordinates,
    dailyCups: readOptional(data, "dailyCups", 80),
    openHours: readOptional(data, "openHours", 160),
    currentSupplier: readOptional(data, "currentSupplier", 160),
    monthlyCost: readOptional(data, "monthlyCost", 80),
    customerBase: readOptional(data, "customerBase", 800),
    goals: readOptional(data, "goals", 800),
    timeline: readOptional(data, "timeline", 80),
    publicListingConsent: consent,
  }

  return {
    id,
    status: "pending",
    createdAt,
    updatedAt: createdAt,
    privateDetails,
    publicLocation: exactCoordinates
      ? {
          id,
          kind: "cafe",
          name: "Verified CupSpace café",
          address: `Near ${suburb}, ${state}`,
          suburb,
          state,
          coordinates: createApproximateCoordinates(id, exactCoordinates),
          description:
            "A verified CupSpace partner café. Exact venue details are shared after campaign confirmation.",
          privacy: "approximate",
        }
      : undefined,
  }
}
