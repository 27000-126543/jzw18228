export interface Employee {
  id: string
  name: string
  department: string
  level: string
  role: 'employee' | 'manager' | 'finance' | 'admin'
  managerId: string
  avatar: string
}

export interface CostBreakdown {
  transportation: number
  accommodation: number
  meals: number
  other: number
  total: number
}

export interface ApprovalNode {
  approverId: string
  approverName: string
  role: string
  status: 'pending' | 'approved' | 'rejected'
  comment: string
  timestamp: string
}

export interface FlightDetail {
  airline: string
  flightNo: string
  departure: string
  arrival: string
  departureTime: string
  arrivalTime: string
  price: number
}

export interface HotelDetail {
  hotelName: string
  roomType: string
  checkIn: string
  checkOut: string
  price: number
  nights: number
  starRating: number
}

export interface BookingRecord {
  id: string
  type: 'flight' | 'hotel'
  applicationId: string
  details: FlightDetail | HotelDetail
  status: 'confirmed' | 'cancelled'
  bookedAt: string
}

export interface AllowanceDetail {
  city: string
  dailyRate: number
  days: number
  total: number
}

export interface TravelApplication {
  id: string
  applicantId: string
  applicantName: string
  department: string
  level: string
  destination: string
  departureDate: string
  returnDate: string
  purpose: string
  estimatedCosts: CostBreakdown
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled'
  approvalFlow: ApprovalNode[]
  bookings: BookingRecord[]
  actualExpenses: CostBreakdown | null
  overBudgetNote: string | null
  dailyAllowance: AllowanceDetail
  settlementStatus: 'unsettled' | 'settled' | 'returned'
  createdAt: string
  updatedAt: string
}

export interface CityAllowance {
  city: string
  dailyRate: number
  tier: 'first' | 'second' | 'third'
}

export interface ApprovalRoute {
  id: string
  name: string
  conditions: {
    maxAmount?: number
    minLevel?: string
  }
  approvers: string[]
}

export type ApplicationStatus = TravelApplication['status']
export type SettlementStatus = TravelApplication['settlementStatus']
