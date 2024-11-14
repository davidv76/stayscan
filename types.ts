export interface Property {
    id: number
    name: string
    location: string
    description: string
    price: number
    status: string
    amenities: string
    images: string
    qrScans: number
  }
  
  export interface MaintenanceIssue {
    id: number
    title: string
    issue: string
    status: string
    property: Property
  }
  
  export interface Subscription {
    name: string
    price: number
    propertyLimit: number
  }