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

type PartnerCluster = {
  idPrefix: string
  area: string
  state: AustralianState
  center: NetworkLocation["coordinates"]
  count: number
  longitudeSpread?: number
  latitudeSpread?: number
}

const createPartnerCluster = ({
  idPrefix,
  area,
  state,
  center,
  count,
  longitudeSpread = 0.07,
  latitudeSpread = 0.05,
}: PartnerCluster) => {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const coordinates = Array.from({ length: count }, (_, index) => {
    const distance = count === 1 ? 0 : Math.sqrt((index + 0.5) / count)
    const angle = index * goldenAngle

    return [
      Number(
        (center[0] + Math.cos(angle) * longitudeSpread * distance).toFixed(5),
      ),
      Number(
        (center[1] + Math.sin(angle) * latitudeSpread * distance).toFixed(5),
      ),
    ] as NetworkLocation["coordinates"]
  })

  return createAnonymousPartnerLocations({
    idPrefix: `expansion-${idPrefix}`,
    area,
    state,
    coordinates,
  })
}

// Exactly 100 additional café markers, weighted by the supplied metro ranking.
const additionalPartnerClusters: PartnerCluster[] = [
  {
    idPrefix: "melbourne",
    area: "Melbourne",
    state: "VIC",
    center: [144.9631, -37.8136],
    count: 9,
  },
  {
    idPrefix: "sydney",
    area: "Sydney",
    state: "NSW",
    center: [151.2093, -33.8688],
    count: 8,
  },
  {
    idPrefix: "brisbane",
    area: "Brisbane",
    state: "QLD",
    center: [153.0251, -27.4698],
    count: 8,
  },
  {
    idPrefix: "perth",
    area: "Perth",
    state: "WA",
    center: [115.8605, -31.9505],
    count: 7,
  },
  {
    idPrefix: "adelaide",
    area: "Adelaide",
    state: "SA",
    center: [138.6007, -34.9285],
    count: 6,
  },
  {
    idPrefix: "gold-coast-tweed-heads",
    area: "Gold Coast–Tweed Heads",
    state: "QLD",
    center: [153.42, -28.03],
    count: 5,
    latitudeSpread: 0.12,
  },
  {
    idPrefix: "newcastle-maitland",
    area: "Newcastle–Maitland",
    state: "NSW",
    center: [151.71, -32.83],
    count: 5,
    longitudeSpread: 0.14,
    latitudeSpread: 0.1,
  },
  {
    idPrefix: "canberra-queanbeyan",
    area: "Canberra–Queanbeyan",
    state: "ACT",
    center: [149.15, -35.3],
    count: 5,
  },
  {
    idPrefix: "sunshine-coast",
    area: "Sunshine Coast",
    state: "QLD",
    center: [153.07, -26.65],
    count: 4,
    latitudeSpread: 0.12,
  },
  {
    idPrefix: "central-coast",
    area: "Central Coast",
    state: "NSW",
    center: [151.34, -33.43],
    count: 4,
    longitudeSpread: 0.1,
    latitudeSpread: 0.1,
  },
  {
    idPrefix: "wollongong",
    area: "Wollongong",
    state: "NSW",
    center: [150.8931, -34.4278],
    count: 4,
  },
  {
    idPrefix: "geelong",
    area: "Geelong",
    state: "VIC",
    center: [144.3617, -38.1499],
    count: 4,
  },
  {
    idPrefix: "hobart",
    area: "Hobart",
    state: "TAS",
    center: [147.3272, -42.8821],
    count: 3,
  },
  {
    idPrefix: "townsville",
    area: "Townsville",
    state: "QLD",
    center: [146.8179, -19.2589],
    count: 3,
  },
  {
    idPrefix: "cairns",
    area: "Cairns",
    state: "QLD",
    center: [145.7781, -16.9186],
    count: 3,
  },
  {
    idPrefix: "toowoomba",
    area: "Toowoomba",
    state: "QLD",
    center: [151.9539, -27.5598],
    count: 3,
  },
  {
    idPrefix: "darwin",
    area: "Darwin",
    state: "NT",
    center: [130.8456, -12.4634],
    count: 3,
  },
  {
    idPrefix: "ballarat",
    area: "Ballarat",
    state: "VIC",
    center: [143.8503, -37.5622],
    count: 3,
  },
  {
    idPrefix: "bendigo",
    area: "Bendigo",
    state: "VIC",
    center: [144.2794, -36.757],
    count: 2,
  },
  {
    idPrefix: "albury-wodonga",
    area: "Albury–Wodonga",
    state: "NSW",
    center: [146.9, -36.1],
    count: 2,
  },
  {
    idPrefix: "launceston",
    area: "Launceston",
    state: "TAS",
    center: [147.1441, -41.4332],
    count: 2,
  },
  {
    idPrefix: "mackay",
    area: "Mackay",
    state: "QLD",
    center: [149.1868, -21.1411],
    count: 2,
  },
  {
    idPrefix: "bunbury",
    area: "Bunbury",
    state: "WA",
    center: [115.64, -33.33],
    count: 2,
  },
  {
    idPrefix: "rockhampton",
    area: "Rockhampton",
    state: "QLD",
    center: [150.51, -23.3781],
    count: 2,
  },
  {
    idPrefix: "bundaberg",
    area: "Bundaberg",
    state: "QLD",
    center: [152.3489, -24.8661],
    count: 1,
  },
]

// One additional marker for every regional location in the supplied list.
const regionalPartnerLocations: PartnerCluster[] = [
  {
    idPrefix: "bundaberg",
    area: "Bundaberg",
    state: "QLD",
    center: [152.3489, -24.8661],
    count: 1,
  },
  {
    idPrefix: "coffs-harbour",
    area: "Coffs Harbour",
    state: "NSW",
    center: [153.1145, -30.2963],
    count: 1,
  },
  {
    idPrefix: "hervey-bay",
    area: "Hervey Bay",
    state: "QLD",
    center: [152.8535, -25.2986],
    count: 1,
  },
  {
    idPrefix: "wagga-wagga",
    area: "Wagga Wagga",
    state: "NSW",
    center: [147.3678, -35.1082],
    count: 1,
  },
  {
    idPrefix: "shepparton-mooroopna",
    area: "Shepparton–Mooroopna",
    state: "VIC",
    center: [145.4, -36.38],
    count: 1,
  },
  {
    idPrefix: "mildura-buronga",
    area: "Mildura–Buronga",
    state: "VIC",
    center: [142.159, -34.185],
    count: 1,
  },
  {
    idPrefix: "port-macquarie",
    area: "Port Macquarie",
    state: "NSW",
    center: [152.9089, -31.433],
    count: 1,
  },
  {
    idPrefix: "gladstone",
    area: "Gladstone",
    state: "QLD",
    center: [151.256, -23.842],
    count: 1,
  },
  {
    idPrefix: "ballina",
    area: "Ballina",
    state: "NSW",
    center: [153.5629, -28.864],
    count: 1,
  },
  {
    idPrefix: "warragul-drouin",
    area: "Warragul-Drouin",
    state: "VIC",
    center: [145.92, -38.13],
    count: 1,
  },
  {
    idPrefix: "tamworth",
    area: "Tamworth",
    state: "NSW",
    center: [150.923, -31.09],
    count: 1,
  },
  {
    idPrefix: "busselton",
    area: "Busselton",
    state: "WA",
    center: [115.347, -33.65],
    count: 1,
  },
  {
    idPrefix: "traralgon-morwell",
    area: "Traralgon-Morwell",
    state: "VIC",
    center: [146.46, -38.23],
    count: 1,
  },
  {
    idPrefix: "orange",
    area: "Orange",
    state: "NSW",
    center: [149.1, -33.28],
    count: 1,
  },
  {
    idPrefix: "bowral-mittagong",
    area: "Bowral-Mittagong",
    state: "NSW",
    center: [150.45, -34.47],
    count: 1,
  },
  {
    idPrefix: "dubbo",
    area: "Dubbo",
    state: "NSW",
    center: [148.601, -32.256],
    count: 1,
  },
  {
    idPrefix: "geraldton",
    area: "Geraldton",
    state: "WA",
    center: [114.611, -28.774],
    count: 1,
  },
  {
    idPrefix: "nowra-bomaderry",
    area: "Nowra-Bomaderry",
    state: "NSW",
    center: [150.6, -34.87],
    count: 1,
  },
  {
    idPrefix: "bathurst",
    area: "Bathurst",
    state: "NSW",
    center: [149.5775, -33.419],
    count: 1,
  },
  {
    idPrefix: "albany",
    area: "Albany",
    state: "WA",
    center: [117.883, -35.027],
    count: 1,
  },
  {
    idPrefix: "warrnambool",
    area: "Warrnambool",
    state: "VIC",
    center: [142.48, -38.38],
    count: 1,
  },
  {
    idPrefix: "devonport",
    area: "Devonport",
    state: "TAS",
    center: [146.35, -41.18],
    count: 1,
  },
  {
    idPrefix: "morisset-cooranbong",
    area: "Morisset-Cooranbong",
    state: "NSW",
    center: [151.5, -33.1],
    count: 1,
  },
  {
    idPrefix: "kalgoorlie-boulder",
    area: "Kalgoorlie-Boulder",
    state: "WA",
    center: [121.47, -30.75],
    count: 1,
  },
  {
    idPrefix: "victor-harbor-goolwa",
    area: "Victor Harbor–Goolwa",
    state: "SA",
    center: [138.62, -35.53],
    count: 1,
  },
  {
    idPrefix: "mount-gambier",
    area: "Mount Gambier",
    state: "SA",
    center: [140.78, -37.83],
    count: 1,
  },
]

// Additional regional markers from the follow-up list, plus Byron Bay.
const followUpPartnerLocations: PartnerCluster[] = [
  {
    idPrefix: "alice-springs",
    area: "Alice Springs",
    state: "NT",
    center: [133.8807, -23.698],
    count: 1,
  },
  {
    idPrefix: "nelson-bay",
    area: "Nelson Bay",
    state: "NSW",
    center: [152.143, -32.72],
    count: 1,
  },
  {
    idPrefix: "maryborough",
    area: "Maryborough",
    state: "QLD",
    center: [152.704, -25.537],
    count: 1,
  },
  {
    idPrefix: "burnie-somerset",
    area: "Burnie-Somerset",
    state: "TAS",
    center: [145.89, -41.05],
    count: 1,
  },
  {
    idPrefix: "lismore",
    area: "Lismore",
    state: "NSW",
    center: [153.277, -28.813],
    count: 1,
  },
  {
    idPrefix: "bacchus-marsh",
    area: "Bacchus Marsh",
    state: "VIC",
    center: [144.437, -37.675],
    count: 1,
  },
  {
    idPrefix: "taree",
    area: "Taree",
    state: "NSW",
    center: [152.46, -31.91],
    count: 1,
  },
  {
    idPrefix: "goulburn",
    area: "Goulburn",
    state: "NSW",
    center: [149.718, -34.75],
    count: 1,
  },
  {
    idPrefix: "gympie",
    area: "Gympie",
    state: "QLD",
    center: [152.665, -26.19],
    count: 1,
  },
  {
    idPrefix: "armidale",
    area: "Armidale",
    state: "NSW",
    center: [151.67, -30.51],
    count: 1,
  },
  {
    idPrefix: "gisborne",
    area: "Gisborne",
    state: "VIC",
    center: [144.59, -37.49],
    count: 1,
  },
  {
    idPrefix: "echuca-moama",
    area: "Echuca-Moama",
    state: "VIC",
    center: [144.75, -36.13],
    count: 1,
  },
  {
    idPrefix: "moe-newborough",
    area: "Moe-Newborough",
    state: "VIC",
    center: [146.27, -38.18],
    count: 1,
  },
  {
    idPrefix: "yeppoon",
    area: "Yeppoon",
    state: "QLD",
    center: [150.744, -23.13],
    count: 1,
  },
  {
    idPrefix: "whyalla",
    area: "Whyalla",
    state: "SA",
    center: [137.58, -33.03],
    count: 1,
  },
  {
    idPrefix: "forster-tuncurry",
    area: "Forster-Tuncurry",
    state: "NSW",
    center: [152.51, -32.18],
    count: 1,
  },
  {
    idPrefix: "griffith",
    area: "Griffith",
    state: "NSW",
    center: [146.04, -34.29],
    count: 1,
  },
  {
    idPrefix: "st-georges-basin-sanctuary-point",
    area: "St Georges Basin-Sanctuary Point",
    state: "NSW",
    center: [150.59, -35.12],
    count: 1,
  },
  {
    idPrefix: "wangaratta",
    area: "Wangaratta",
    state: "VIC",
    center: [146.32, -36.36],
    count: 1,
  },
  {
    idPrefix: "camden-haven",
    area: "Camden Haven",
    state: "NSW",
    center: [152.7, -31.64],
    count: 1,
  },
  {
    idPrefix: "murray-bridge",
    area: "Murray Bridge",
    state: "SA",
    center: [139.27, -35.12],
    count: 1,
  },
  {
    idPrefix: "grafton",
    area: "Grafton",
    state: "NSW",
    center: [152.93, -29.69],
    count: 1,
  },
  {
    idPrefix: "karratha",
    area: "Karratha",
    state: "WA",
    center: [116.85, -20.74],
    count: 1,
  },
  {
    idPrefix: "mount-isa",
    area: "Mount Isa",
    state: "QLD",
    center: [139.49, -20.73],
    count: 1,
  },
  {
    idPrefix: "batemans-bay",
    area: "Batemans Bay",
    state: "NSW",
    center: [150.18, -35.71],
    count: 1,
  },
  {
    idPrefix: "ulladulla",
    area: "Ulladulla",
    state: "NSW",
    center: [150.47, -35.36],
    count: 1,
  },
  {
    idPrefix: "byron-bay",
    area: "Byron Bay",
    state: "NSW",
    center: [153.612, -28.647],
    count: 3,
    longitudeSpread: 0.025,
    latitudeSpread: 0.02,
  },
]

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
  ...additionalPartnerClusters.flatMap(createPartnerCluster),
  ...regionalPartnerLocations.flatMap((cluster) =>
    createPartnerCluster({
      ...cluster,
      idPrefix: `regional-${cluster.idPrefix}`,
    }),
  ),
  ...followUpPartnerLocations.flatMap((cluster) =>
    createPartnerCluster({
      ...cluster,
      idPrefix: `follow-up-${cluster.idPrefix}`,
    }),
  ),
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
