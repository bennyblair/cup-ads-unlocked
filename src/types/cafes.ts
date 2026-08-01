import type { AustralianState, NetworkLocation } from "../data/locations"

export type CafeApplicationStatus = "pending" | "approved" | "rejected"

export interface CafePrivateDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  cafeName: string
  role: string
  address: string
  suburb: string
  state: AustralianState
  postcode: string
  exactCoordinates: [longitude: number, latitude: number]
  dailyCups: string
  openHours: string
  currentSupplier: string
  monthlyCost: string
  customerBase: string
  goals: string
  timeline: string
  publicListingConsent: string
}

export interface PublicCafeLocation extends NetworkLocation {
  kind: "cafe"
  privacy: "approximate"
}

export interface CafeApplicationRecord {
  id: string
  status: CafeApplicationStatus
  createdAt: string
  updatedAt: string
  privateDetails: CafePrivateDetails
  publicLocation: PublicCafeLocation
}

export interface PublicCafesResponse {
  cafes: PublicCafeLocation[]
}

export interface AdminCafesResponse {
  pending: CafeApplicationRecord[]
  approved: CafeApplicationRecord[]
}
