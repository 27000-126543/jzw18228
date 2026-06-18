import { create } from 'zustand'
import type { TravelApplication, Employee, BookingRecord, CostBreakdown } from '@/types'
import { generateMockApplications, EMPLOYEES, CITY_ALLOWANCES, CURRENT_USER, MOCK_FLIGHTS, MOCK_HOTELS } from '@/data/mockData'
import { differenceInDays } from 'date-fns'

interface AppState {
  currentUser: Employee
  applications: TravelApplication[]
  employees: Employee[]
  cityAllowances: typeof CITY_ALLOWANCES
  mockFlights: typeof MOCK_FLIGHTS
  mockHotels: typeof MOCK_HOTELS

  addApplication: (app: Omit<TravelApplication, 'id' | 'createdAt' | 'updatedAt' | 'approvalFlow' | 'bookings' | 'actualExpenses' | 'overBudgetNote' | 'settlementStatus' | 'dailyAllowance'>) => void
  updateApplicationStatus: (id: string, status: TravelApplication['status']) => void
  approveApplication: (id: string, approverId: string, comment: string) => void
  rejectApplication: (id: string, approverId: string, comment: string) => void
  addBooking: (booking: Omit<BookingRecord, 'id' | 'bookedAt' | 'status'>) => void
  submitExpenses: (id: string, expenses: CostBreakdown, overBudgetNote: string | null) => void
  settleApplications: (ids: string[]) => void
  returnApplication: (id: string) => void
}

export const useStore = create<AppState>((set, get) => ({
  currentUser: CURRENT_USER,
  applications: generateMockApplications(),
  employees: EMPLOYEES,
  cityAllowances: CITY_ALLOWANCES,
  mockFlights: MOCK_FLIGHTS,
  mockHotels: MOCK_HOTELS,

  addApplication: (app) => {
    const newApp: TravelApplication = {
      ...app,
      id: `app-${String(get().applications.length + 1).padStart(3, '0')}`,
      approvalFlow: [],
      bookings: [],
      actualExpenses: null,
      overBudgetNote: null,
      dailyAllowance: {
        city: app.destination,
        dailyRate: CITY_ALLOWANCES.find(c => c.city === app.destination)?.dailyRate || 300,
        days: differenceInDays(new Date(app.returnDate), new Date(app.departureDate)) || 1,
        total: (CITY_ALLOWANCES.find(c => c.city === app.destination)?.dailyRate || 300) * (differenceInDays(new Date(app.returnDate), new Date(app.departureDate)) || 1),
      },
      settlementStatus: 'unsettled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set(state => ({ applications: [newApp, ...state.applications] }))
  },

  updateApplicationStatus: (id, status) => {
    set(state => ({
      applications: state.applications.map(app =>
        app.id === id ? { ...app, status, updatedAt: new Date().toISOString() } : app
      ),
    }))
  },

  approveApplication: (id, approverId, comment) => {
    const approver = get().employees.find(e => e.id === approverId)
    set(state => ({
      applications: state.applications.map(app => {
        if (app.id !== id) return app
        const flow = [...app.approvalFlow]
        const pendingIdx = flow.findIndex(n => n.status === 'pending')
        if (pendingIdx >= 0) {
          flow[pendingIdx] = {
            ...flow[pendingIdx],
            status: 'approved',
            comment,
            timestamp: new Date().toISOString(),
          }
        }
        const allApproved = flow.every(n => n.status === 'approved')
        return {
          ...app,
          status: allApproved ? 'approved' : 'pending',
          approvalFlow: flow,
          updatedAt: new Date().toISOString(),
        }
      }),
    }))
  },

  rejectApplication: (id, approverId, comment) => {
    const approver = get().employees.find(e => e.id === approverId)
    set(state => ({
      applications: state.applications.map(app => {
        if (app.id !== id) return app
        const flow = [...app.approvalFlow]
        const pendingIdx = flow.findIndex(n => n.status === 'pending')
        if (pendingIdx >= 0) {
          flow[pendingIdx] = {
            ...flow[pendingIdx],
            status: 'rejected',
            comment,
            timestamp: new Date().toISOString(),
          }
        }
        return {
          ...app,
          status: 'rejected',
          approvalFlow: flow,
          updatedAt: new Date().toISOString(),
        }
      }),
    }))
  },

  addBooking: (booking) => {
    const newBooking: BookingRecord = {
      ...booking,
      id: `bk-${Date.now()}`,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
    }
    set(state => ({
      applications: state.applications.map(app =>
        app.id === booking.applicationId
          ? { ...app, bookings: [...app.bookings, newBooking], updatedAt: new Date().toISOString() }
          : app
      ),
    }))
  },

  submitExpenses: (id, expenses, overBudgetNote) => {
    set(state => ({
      applications: state.applications.map(app =>
        app.id === id
          ? { ...app, actualExpenses: expenses, overBudgetNote, updatedAt: new Date().toISOString() }
          : app
      ),
    }))
  },

  settleApplications: (ids) => {
    set(state => ({
      applications: state.applications.map(app =>
        ids.includes(app.id)
          ? { ...app, settlementStatus: 'settled', updatedAt: new Date().toISOString() }
          : app
      ),
    }))
  },

  returnApplication: (id) => {
    set(state => ({
      applications: state.applications.map(app =>
        app.id === id
          ? { ...app, settlementStatus: 'returned', updatedAt: new Date().toISOString() }
          : app
      ),
    }))
  },
}))
