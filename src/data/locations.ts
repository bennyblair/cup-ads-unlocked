export type NetworkLocationKind = "cafe" | "target"

export type AustralianState =
  | "ACT"
  | "NSW"
  | "NT"
  | "QLD"
  | "SA"
  | "TAS"
  | "VIC"
  | "WA"

export interface NetworkLocation {
  id: string
  kind: NetworkLocationKind
  name: string
  address: string
  suburb: string
  state: AustralianState
  coordinates: [longitude: number, latitude: number]
  description: string
}

const createAnonymousPartnerLocations = ({
  idPrefix,
  area,
  suburb = area,
  state,
  coordinates,
}: {
  idPrefix: string
  area: string
  suburb?: string
  state: AustralianState
  coordinates: NetworkLocation["coordinates"][]
}): NetworkLocation[] =>
  coordinates.map((point, index) => ({
    id: `${idPrefix}-${index + 1}`,
    kind: "cafe",
    name: `Partner café — ${area}`,
    address: `${area} area, ${state}`,
    suburb,
    state,
    coordinates: point,
    description: `An active CupSpace partner location in the ${area} area. Exact café details are kept private.`,
  }))

// Public partner locations are approximate and never expose café names.
// Custom suburb requests are collected through the advertiser form.
export const networkLocations: NetworkLocation[] = [
  {
    id: "partner-bondi-1",
    kind: "cafe",
    name: "Partner café — Bondi area",
    address: "Bondi area, NSW",
    suburb: "Bondi",
    state: "NSW",
    coordinates: [151.2748, -33.8915],
    description:
      "An active CupSpace partner location in the Bondi area. Exact café details are kept private.",
  },
  {
    id: "partner-bondi-2",
    kind: "cafe",
    name: "Partner café — Bondi area",
    address: "Bondi area, NSW",
    suburb: "Bondi",
    state: "NSW",
    coordinates: [151.269, -33.887],
    description:
      "An active CupSpace partner location in the Bondi area. Exact café details are kept private.",
  },
  {
    id: "partner-bondi-junction",
    kind: "cafe",
    name: "Partner café — Bondi Junction",
    address: "Bondi Junction area, NSW",
    suburb: "Bondi Junction",
    state: "NSW",
    coordinates: [151.2478, -33.8911],
    description:
      "An active CupSpace partner location in the Bondi Junction area. Exact café details are kept private.",
  },
  {
    id: "partner-woollahra",
    kind: "cafe",
    name: "Partner café — Woollahra",
    address: "Woollahra area, NSW",
    suburb: "Woollahra",
    state: "NSW",
    coordinates: [151.2378, -33.8894],
    description:
      "An active CupSpace partner location in the Woollahra area. Exact café details are kept private.",
  },
  {
    id: "partner-edgecliff-1",
    kind: "cafe",
    name: "Partner café — Edgecliff area",
    address: "Edgecliff area, NSW",
    suburb: "Edgecliff",
    state: "NSW",
    coordinates: [151.2361, -33.879],
    description:
      "An active CupSpace partner location in the Edgecliff area. Exact café details are kept private.",
  },
  {
    id: "partner-edgecliff-2",
    kind: "cafe",
    name: "Partner café — Edgecliff area",
    address: "Edgecliff area, NSW",
    suburb: "Edgecliff",
    state: "NSW",
    coordinates: [151.2398, -33.878],
    description:
      "An active CupSpace partner location in the Edgecliff area. Exact café details are kept private.",
  },
  {
    id: "partner-maroubra-beach",
    kind: "cafe",
    name: "Partner café — Maroubra Beach",
    address: "Maroubra Beach area, NSW",
    suburb: "Maroubra",
    state: "NSW",
    coordinates: [151.2569, -33.9473],
    description:
      "An active CupSpace partner location in the Maroubra Beach area. Exact café details are kept private.",
  },
  {
    id: "partner-sydney-cbd-north",
    kind: "cafe",
    name: "Partner café — Sydney City",
    address: "Sydney City area, NSW",
    suburb: "Sydney",
    state: "NSW",
    coordinates: [151.2091, -33.8645],
    description:
      "An active CupSpace partner location in Sydney City. Exact café details are kept private.",
  },
  {
    id: "partner-sydney-cbd-south",
    kind: "cafe",
    name: "Partner café — Sydney City",
    address: "Sydney City area, NSW",
    suburb: "Sydney",
    state: "NSW",
    coordinates: [151.2076, -33.8752],
    description:
      "An active CupSpace partner location in Sydney City. Exact café details are kept private.",
  },
  {
    id: "partner-sydney-west",
    kind: "cafe",
    name: "Partner café — Sydney City",
    address: "Sydney City area, NSW",
    suburb: "Sydney",
    state: "NSW",
    coordinates: [151.2007, -33.8681],
    description:
      "An active CupSpace partner location in Sydney City. Exact café details are kept private.",
  },
  {
    id: "partner-sydney-east",
    kind: "cafe",
    name: "Partner café — Sydney City",
    address: "Sydney City area, NSW",
    suburb: "Sydney",
    state: "NSW",
    coordinates: [151.2169, -33.8741],
    description:
      "An active CupSpace partner location in Sydney City. Exact café details are kept private.",
  },
  ...createAnonymousPartnerLocations({
    idPrefix: "partner-melbourne",
    area: "Melbourne",
    state: "VIC",
    coordinates: [
      [144.9631, -37.8136],
      [144.978, -37.801],
      [144.966, -37.825],
    ],
  }),
  ...createAnonymousPartnerLocations({
    idPrefix: "partner-brisbane",
    area: "Brisbane",
    state: "QLD",
    coordinates: [
      [153.0251, -27.4698],
      [153.034, -27.456],
      [153.018, -27.478],
    ],
  }),
  ...createAnonymousPartnerLocations({
    idPrefix: "partner-gold-coast",
    area: "Gold Coast",
    state: "QLD",
    coordinates: [
      [153.428, -28.002],
      [153.431, -28.027],
      [153.413, -27.969],
    ],
  }),
  ...createAnonymousPartnerLocations({
    idPrefix: "partner-perth",
    area: "Perth",
    state: "WA",
    coordinates: [
      [115.8605, -31.9505],
      [115.858, -31.946],
      [115.847, -31.95],
    ],
  }),
  ...createAnonymousPartnerLocations({
    idPrefix: "partner-adelaide",
    area: "Adelaide",
    state: "SA",
    coordinates: [
      [138.6007, -34.9285],
      [138.596, -34.91],
      [138.63, -34.922],
    ],
  }),
  ...createAnonymousPartnerLocations({
    idPrefix: "partner-canberra",
    area: "Canberra",
    state: "ACT",
    coordinates: [
      [149.13, -35.2809],
      [149.135, -35.274],
    ],
  }),
  ...createAnonymousPartnerLocations({
    idPrefix: "partner-hobart",
    area: "Hobart",
    state: "TAS",
    coordinates: [
      [147.3272, -42.8821],
      [147.315, -42.874],
    ],
  }),
  ...createAnonymousPartnerLocations({
    idPrefix: "partner-darwin",
    area: "Darwin",
    state: "NT",
    coordinates: [
      [130.8456, -12.4634],
      [130.843, -12.447],
    ],
  }),
]

export const getNetworkLocation = (id: string | null) =>
  id ? networkLocations.find((location) => location.id === id) : undefined

export const getAdvertiserRequestUrl = (location?: NetworkLocation) => {
  if (!location) {
    return "/advertiser-form?type=custom"
  }

  const params = new URLSearchParams({
    type: location.kind,
    id: location.id,
    name: location.name,
    address: location.address,
  })

  return `/advertiser-form?${params.toString()}`
}
