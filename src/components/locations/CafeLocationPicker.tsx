import { useCallback, useEffect, useRef, useState } from "react"
import maplibregl, { type Map, type Marker } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { Crosshair, MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"

const mapStyle = "https://tiles.openfreemap.org/styles/positron"

type Coordinates = [longitude: number, latitude: number]

const CafeLocationPicker = ({
  coordinates,
  onChange,
}: {
  coordinates: Coordinates | null
  onChange: (coordinates: Coordinates) => void
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markerRef = useRef<Marker | null>(null)
  const [locationError, setLocationError] = useState("")

  const placePin = useCallback(
    (nextCoordinates: Coordinates, zoom = false) => {
      onChange(nextCoordinates)

      if (!mapRef.current) {
        return
      }

      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({
          color: "#176746",
          draggable: true,
        })
          .setLngLat(nextCoordinates)
          .addTo(mapRef.current)

        markerRef.current.on("dragend", () => {
          const point = markerRef.current?.getLngLat()
          if (point) {
            onChange([point.lng, point.lat])
          }
        })
      } else {
        markerRef.current.setLngLat(nextCoordinates)
      }

      if (zoom) {
        mapRef.current.flyTo({
          center: nextCoordinates,
          zoom: 16,
          essential: true,
        })
      }
    },
    [onChange],
  )

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: [133.7751, -28.2744],
      zoom: 3,
      minZoom: 2.4,
      maxZoom: 18,
      attributionControl: { compact: true },
    })

    mapRef.current = map
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    )
    map.on("click", (event) => {
      setLocationError("")
      placePin([event.lngLat.lng, event.lngLat.lat])
    })

    return () => {
      markerRef.current = null
      map.remove()
      mapRef.current = null
    }
  }, [placePin])

  useEffect(() => {
    if (coordinates) {
      placePin(coordinates)
    } else {
      markerRef.current?.remove()
      markerRef.current = null
    }
  }, [coordinates, placePin])

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Location is not available in this browser.")
      return
    }

    setLocationError("")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        placePin(
          [position.coords.longitude, position.coords.latitude],
          true,
        )
      },
      () => {
        setLocationError(
          "We could not access your location. Zoom in and click the café on the map instead.",
        )
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold text-foreground">Place the private café pin *</p>
          <p className="text-sm text-muted-foreground">
            Click the exact café location. The public marker will be offset by
            220–400 metres and will not show your café name or address.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 gap-2"
          onClick={useCurrentLocation}
        >
          <Crosshair className="h-4 w-4" />
          Use my location
        </Button>
      </div>

      <div className="relative h-[360px] overflow-hidden rounded-2xl border border-border bg-secondary">
        <div
          ref={containerRef}
          className="h-full w-full"
          aria-label="Choose the exact café location"
        />
        {!coordinates && (
          <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 px-4 py-3 text-sm font-medium text-primary shadow-lg sm:right-auto">
            Zoom in, then click your café to place the pin.
          </div>
        )}
      </div>

      <input
        type="hidden"
        name="exactLongitude"
        value={coordinates?.[0] ?? ""}
      />
      <input
        type="hidden"
        name="exactLatitude"
        value={coordinates?.[1] ?? ""}
      />

      {coordinates && (
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <MapPin className="h-4 w-4" />
          Private pin selected. Drag it to adjust the exact position.
        </p>
      )}
      {locationError && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {locationError}
        </p>
      )}
    </div>
  )
}

export default CafeLocationPicker
