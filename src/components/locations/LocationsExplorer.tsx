import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import maplibregl, {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapGeoJSONFeature,
  type MapMouseEvent,
} from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { ArrowRight, Coffee, LocateFixed, MapPin, Search } from "lucide-react"

import {
  getAdvertiserRequestUrl,
  networkLocations,
  type NetworkLocation,
  type NetworkLocationKind,
} from "@/data/locations"
import {
  cafesUpdatedEvent,
  getPublicCafeLocations,
} from "@/lib/cafe-api"
import { cn } from "@/lib/utils"
import type { PublicCafeLocation } from "@/types/cafes"

const mapStyle = "https://tiles.openfreemap.org/styles/positron"
const australiaCenter: [longitude: number, latitude: number] = [
  133.7751, -28.2744,
]

interface LocationArea {
  id: string
  kind: NetworkLocationKind
  name: string
  address: string
  state: NetworkLocation["state"]
  coordinates: NetworkLocation["coordinates"]
  locations: NetworkLocation[]
}

const getAreaId = (location: NetworkLocation) =>
  location.kind === "cafe"
    ? `cafe:${location.state}:${location.suburb.trim().toLowerCase()}`
    : location.id

const getCafeAreaName = (location: NetworkLocation) => {
  const withoutState = location.address
    .replace(/^Near\s+/i, "")
    .replace(/,\s*(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)$/i, "")
    .replace(/\s+area$/i, "")
    .trim()

  return withoutState || location.suburb
}

const groupLocationsByArea = (locations: NetworkLocation[]) => {
  const groups = new Map<string, LocationArea>()

  locations.forEach((location) => {
    const id = getAreaId(location)
    const existing = groups.get(id)

    if (existing) {
      existing.locations.push(location)
      const count = existing.locations.length
      existing.coordinates = [
        (existing.coordinates[0] * (count - 1) + location.coordinates[0]) /
          count,
        (existing.coordinates[1] * (count - 1) + location.coordinates[1]) /
          count,
      ]
      return
    }

    const name =
      location.kind === "cafe" ? getCafeAreaName(location) : location.name

    groups.set(id, {
      id,
      kind: location.kind,
      name,
      address:
        location.kind === "cafe"
          ? `${name}, ${location.state}`
          : location.address,
      state: location.state,
      coordinates: [...location.coordinates],
      locations: [location],
    })
  })

  return [...groups.values()].sort((first, second) => {
    if (first.kind === "cafe" && second.kind === "cafe") {
      return (
        second.locations.length - first.locations.length ||
        first.name.localeCompare(second.name)
      )
    }

    return first.name.localeCompare(second.name)
  })
}

const toFeatureCollection = (locations: NetworkLocation[]) => ({
  type: "FeatureCollection" as const,
  features: locations.map((location) => ({
    type: "Feature" as const,
    id: location.id,
    geometry: {
      type: "Point" as const,
      coordinates: location.coordinates,
    },
    properties: {
      ...location,
      areaId: getAreaId(location),
      coordinates: undefined,
    },
  })),
})

const LocationsExplorer = ({
  className,
  compact = false,
}: {
  className?: string
  compact?: boolean
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const [selectedAreaId, setSelectedAreaId] = useState("")
  const [query, setQuery] = useState("")
  const [publishedCafes, setPublishedCafes] = useState<PublicCafeLocation[]>([])

  const allLocations = useMemo(
    () => [...publishedCafes, ...networkLocations],
    [publishedCafes],
  )

  useEffect(() => {
    let cancelled = false

    const loadPublishedCafes = async () => {
      try {
        const cafes = await getPublicCafeLocations()
        if (!cancelled) {
          setPublishedCafes(cafes)
        }
      } catch {
        if (!cancelled) {
          setPublishedCafes([])
        }
      }
    }

    void loadPublishedCafes()
    window.addEventListener(cafesUpdatedEvent, loadPublishedCafes)

    return () => {
      cancelled = true
      window.removeEventListener(cafesUpdatedEvent, loadPublishedCafes)
    }
  }, [])

  const cafeAreas = useMemo(
    () =>
      groupLocationsByArea(
        allLocations.filter((location) => location.kind === "cafe"),
      ),
    [allLocations],
  )
  const cafeCount = allLocations.filter(
    (location) => location.kind === "cafe",
  ).length

  const filteredLocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return allLocations.filter((location) => {
      const isPartnerCafe = location.kind === "cafe"
      const matchesQuery =
        !normalizedQuery ||
        `${location.name} ${location.address} ${location.suburb} ${location.state}`
          .toLowerCase()
          .includes(normalizedQuery)

      return isPartnerCafe && matchesQuery
    })
  }, [allLocations, query])

  const filteredAreas = useMemo(
    () => groupLocationsByArea(filteredLocations),
    [filteredLocations],
  )

  const selectedArea =
    filteredAreas.find((area) => area.id === selectedAreaId) ??
    filteredAreas[0]

  const selectedRequestLocation: NetworkLocation | undefined = selectedArea
    ? {
        ...selectedArea.locations[0],
        id: selectedArea.id,
        name: selectedArea.name,
        address: selectedArea.address,
        coordinates: selectedArea.coordinates,
      }
    : undefined

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: australiaCenter,
      zoom: 3,
      minZoom: 2.4,
      maxZoom: 16,
      attributionControl: { compact: true },
    })

    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")

    map.on("load", () => {
      const cafes = networkLocations.filter((location) => location.kind === "cafe")

      map.addSource("cupspace-cafes", {
        type: "geojson",
        data: toFeatureCollection(cafes),
        cluster: true,
        clusterMaxZoom: 11,
        clusterRadius: 48,
      })

      map.addLayer({
        id: "cafe-clusters",
        type: "circle",
        source: "cupspace-cafes",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#176746",
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 30, 30],
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 2,
        },
      })

      map.addLayer({
        id: "cafe-cluster-count",
        type: "symbol",
        source: "cupspace-cafes",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 12,
        },
        paint: {
          "text-color": "#ffffff",
        },
      })

      map.addLayer({
        id: "cafe-points",
        type: "circle",
        source: "cupspace-cafes",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 9,
          "circle-color": "#176746",
          "circle-stroke-color": "#ffffff",
          "circle-stroke-width": 3,
        },
      })

      map.addLayer({
        id: "cafe-cluster-hit",
        type: "circle",
        source: "cupspace-cafes",
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": 32,
          "circle-color": "#176746",
          "circle-opacity": 0.01,
        },
      })

      map.addLayer({
        id: "cafe-point-hit",
        type: "circle",
        source: "cupspace-cafes",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 18,
          "circle-color": "#176746",
          "circle-opacity": 0.01,
        },
      })

      const interactiveLayerIds = ["cafe-cluster-hit", "cafe-point-hit"]

      const getFeatureCoordinates = (feature: MapGeoJSONFeature) =>
        (
          feature.geometry as GeoJSON.Point | undefined
        )?.coordinates as [number, number] | undefined

      const selectCafe = (feature: MapGeoJSONFeature) => {
        const areaId = feature.properties?.areaId
        if (typeof areaId === "string") {
          setSelectedAreaId(areaId)
        }

        const coordinates = getFeatureCoordinates(feature)
        if (coordinates) {
          map.flyTo({
            center: coordinates,
            zoom: Math.min(15, Math.max(map.getZoom() + 1, 13)),
            duration: 850,
            essential: true,
          })
        }
      }

      const zoomIntoCluster = async (feature: MapGeoJSONFeature) => {
        const clusterId = Number(feature.properties?.cluster_id)
        const source = map.getSource("cupspace-cafes") as GeoJSONSource
        if (!Number.isInteger(clusterId)) {
          return
        }

        const expansionZoom = await source.getClusterExpansionZoom(clusterId)
        const coordinates = getFeatureCoordinates(feature)

        if (coordinates) {
          map.flyTo({
            center: coordinates,
            zoom: Math.min(
              14,
              Math.max(expansionZoom, map.getZoom() + 2, 9),
            ),
            duration: 900,
            essential: true,
          })
        }
      }

      const getInteractiveFeatures = (event: MapMouseEvent) =>
        map.queryRenderedFeatures(event.point, { layers: interactiveLayerIds })

      map.on("click", (event) => {
        const feature = getInteractiveFeatures(event)[0]
        if (!feature) {
          return
        }

        if (Number.isInteger(Number(feature.properties?.cluster_id))) {
          void zoomIntoCluster(feature)
        } else {
          selectCafe(feature)
        }
      })

      map.on("mousemove", (event) => {
        map.getCanvas().style.cursor = getInteractiveFeatures(event).length
          ? "pointer"
          : ""
      })

      map.on("mouseout", () => {
        map.getCanvas().style.cursor = ""
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    const updateSources = () => {
      const cafes = filteredLocations.filter((location) => location.kind === "cafe")
      ;(map.getSource("cupspace-cafes") as GeoJSONSource | undefined)?.setData(
        toFeatureCollection(cafes),
      )
    }

    if (map.isStyleLoaded()) {
      updateSources()
    } else {
      map.once("load", updateSources)
    }
  }, [filteredLocations])

  const focusArea = (area: LocationArea) => {
    setSelectedAreaId(area.id)
    const map = mapRef.current
    if (!map) {
      return
    }

    if (area.locations.length > 1) {
      const bounds = new maplibregl.LngLatBounds()
      area.locations.forEach((location) => bounds.extend(location.coordinates))
      map.fitBounds(bounds, {
        padding: 90,
        maxZoom: 13,
        essential: true,
      })
      return
    }

    map.flyTo({
      center: area.coordinates,
      zoom: area.kind === "cafe" ? 13 : 10,
      essential: true,
    })
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-none border-2 border-foreground bg-card",
        className,
      )}
    >
      <div className="grid min-h-[680px] lg:h-[680px] lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)]">
        <div className="relative min-h-[430px] lg:min-h-[680px]">
          <div
            ref={mapContainerRef}
            className="absolute inset-0"
            style={{ position: "absolute" }}
            aria-label="Interactive map of CupSpace partner cafés across Australia"
          />

          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 sm:right-auto">
            <div className="flex items-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-primary shadow-[4px_4px_0_hsl(var(--foreground))]">
              <span className="h-3 w-3 rounded-full bg-primary ring-2 ring-white" />
              Live partner cafés · Click a circle to zoom
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-col bg-background">
          <div className="border-b border-border p-5">
            <div className="flex items-center justify-between gap-4 border-2 border-foreground bg-primary p-4 text-primary-foreground">
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border border-primary-foreground bg-primary text-primary-foreground">
                  <Coffee className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-accent">
                    Live network
                  </span>
                  <span className="mt-0.5 block text-sm font-bold text-primary-foreground">
                    {cafeCount} cafés across {cafeAreas.length} areas
                  </span>
                </span>
              </span>
            </div>

            <label className="relative mt-4 block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <span className="sr-only">Search locations</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search live partner areas"
                className="h-11 w-full rounded-none border-2 border-input bg-card pl-10 pr-4 text-sm outline-none transition focus:ring-2 focus:ring-accent focus:ring-offset-2"
              />
            </label>

            <Link
              to={getAdvertiserRequestUrl()}
              className="group mt-3 inline-flex w-full items-center gap-3 border-2 border-foreground bg-accent px-4 py-3 text-foreground transition hover:bg-foreground hover:text-background"
            >
              <LocateFixed className="h-5 w-5 shrink-0" />
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-bold">
                  Request a specific suburb
                </span>
                <span className="block text-xs opacity-70">
                  Tell us where your campaign should run
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {selectedArea ? (
              <div className="mb-5 border-2 border-foreground bg-secondary p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                    Live partner coverage
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-primary">
                  {selectedArea.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {selectedArea.locations.length} partner {" "}
                  {selectedArea.locations.length === 1 ? "café" : "cafés"} available
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Plan a multi-location campaign in this area. Exact venues
                  remain private until campaign confirmation.
                </p>
                <Link
                  to={getAdvertiserRequestUrl(selectedRequestLocation)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 border-2 border-foreground bg-primary px-4 py-3 text-sm font-bold uppercase tracking-[0.06em] text-primary-foreground transition hover:bg-foreground"
                >
                  Advertise in {selectedArea.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="mb-5 border-2 border-dashed border-border p-5 text-sm text-muted-foreground">
                No locations match those filters.
              </div>
            )}

            {compact ? (
              <Link
                to="/locations"
                className="group flex items-center gap-3 border-2 border-foreground bg-card p-4 transition hover:bg-foreground hover:text-background"
              >
                <MapPin className="h-5 w-5 shrink-0 text-primary group-hover:text-accent" />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">
                    View all {cafeAreas.length} areas
                  </span>
                  <span className="block text-xs opacity-70">
                    Search and compare the full network
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <>
                <div className="mb-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      Available now
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Grouped by campaign area
                    </p>
                  </div>
                  <span className="shrink-0 border border-foreground bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                    {filteredAreas.length} {filteredAreas.length === 1 ? "area" : "areas"}
                  </span>
                </div>

                <div className="space-y-2" aria-label="Map coverage areas">
                  {filteredAreas.map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => focusArea(area)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-none border-2 p-3 text-left transition",
                        selectedArea?.id === area.id
                          ? "border-primary/30 bg-primary/5"
                          : "border-transparent hover:border-border hover:bg-secondary/60",
                      )}
                    >
                      <MapPin
                        className="h-5 w-5 shrink-0 text-primary"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-foreground">
                          {area.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {area.locations.length} partner {" "}
                          {area.locations.length === 1 ? "café" : "cafés"}
                        </span>
                      </span>
                      <span className="flex h-8 min-w-8 items-center justify-center border border-foreground bg-primary text-xs font-bold text-primary-foreground">
                        {area.locations.length}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default LocationsExplorer
