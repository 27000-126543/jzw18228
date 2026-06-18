import { create } from 'zustand'
import type { TravelApplication, Employee, BookingRecord, CostBreakdown, ApprovalNode } from '@/types'
import { generateMockApplications, EMPLOYEES, CITY_ALLOWANCES, CURRENT_USER, MOCK_FLIGHTS, MOCK_HOTELS } from '@/data/mockData'
import { differenceInDays } from 'date-fns'

const STORAGE_KEY = 'travel_mgmt_applications_v1'

export function calculateAllowanceDays(departure: string, returnDate: string): number {
  const days = differenceInDays(new Date(returnDate), new Date(departure))
  return Math.max(1, days)
}

export function getDailyRate(city: string, allowances: typeof CITY_ALLOWANCES): number {
  return allowances.find(c => c.city === city)?.dailyRate ?? 300
}

function levelRank(level: string): number {
  const m = level.match(/^P(\d+)/)
  return m ? parseInt(m[1], 10) : 3
}

export function generateApprovalFlow(
  applicant: Employee,
  totalAmount: number,
  employees: Employee[],
): ApprovalNode[] {
  const nodes: ApprovalNode[] = []
  const now = new Date().toISOString()

  const directManager = employees.find(e => e.id === applicant.managerId)
  const departmentManager = employees.find(e =>
    e.role === 'manager' && e.department === applicant.department
  ) || employees.find(e => e.role === 'manager')
  const financeManager = employees.find(e =>
    e.role === 'finance'
  ) || employees.find(e => e.role === 'admin')

  if (directManager) {
    nodes.push({
      approverId: directManager.id,
      approverName: directManager.name,
      role: '直属主管',
      status: 'pending',
      comment: '',
      timestamp: now,
    })
  }

  const needDeptHead = totalAmount > 5000 || levelRank(applicant.level) >= 6
  if (needDeptHead && departmentManager && departmentManager.id !== directManager?.id) {
    nodes.push({
      approverId: departmentManager.id,
      approverName: departmentManager.name,
      role: '部门总监',
      status: 'pending',
      comment: '',
      timestamp: now,
    })
  }

  if (totalAmount > 20000 && financeManager) {
    const alreadyIn = nodes.some(n => n.approverId === financeManager.id)
    if (!alreadyIn) {
      nodes.push({
        approverId: financeManager.id,
        approverName: financeManager.name,
        role: '财务总监',
        status: 'pending',
        comment: '',
        timestamp: now,
      })
    }
  }

  if (nodes.length === 0) {
    nodes.push({
      approverId: 'emp013',
      approverName: '林总',
      role: '系统管理员',
      status: 'pending',
      comment: '',
      timestamp: now,
    })
  }

  return nodes
}

function loadFromStorage(): TravelApplication[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as TravelApplication[]
  } catch {
    return null
  }
}

function saveToStorage(apps: TravelApplication[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps))
  } catch {}
}

interface AppState {
  currentUser: Employee
  applications: TravelApplication[]
  employees: Employee[]
  cityAllowances: typeof CITY_ALLOWANCES
  mockFlights: typeof MOCK_FLIGHTS
  mockHotels: typeof MOCK_HOTELS

  setCurrentUser: (empId: string) => void
  addApplication: (app: Omit<TravelApplication, 'id' | 'createdAt' | 'updatedAt' | 'approvalFlow' | 'bookings' | 'actualExpenses' | 'overBudgetNote' | 'settlementStatus' | 'dailyAllowance'>) => void
  updateApplicationStatus: (id: string, status: TravelApplication['status']) => void
  approveApplication: (id: string, approverId: string, comment: string) => void
  rejectApplication: (id: string, approverId: string, comment: string) => void
  addBooking: (booking: Omit<BookingRecord, 'id' | 'bookedAt' | 'status'>) => void
  submitExpenses: (id: string, expenses: CostBreakdown, overBudgetNote: string | null) => void
  settleApplications: (ids: string[]) => void
  returnApplication: (id: string) => void
  isMyPendingApproval: (app: TravelApplication, userId: string, userRole: Employee['role']) => boolean
}

export const useStore = create<AppState>((set, get) => {
  const initial = loadFromStorage() ?? generateMockApplications()
  saveToStorage(initial)

  return {
    currentUser: CURRENT_USER,
    applications: initial,
    employees: EMPLOYEES,
    cityAllowances: CITY_ALLOWANCES,
    mockFlights: MOCK_FLIGHTS,
    mockHotels: MOCK_HOTELS,

    setCurrentUser: (empId) => {
      const emp = get().employees.find(e => e.id === empId) || CURRENT_USER
      set({ currentUser: emp })
    },

    isMyPendingApproval: (app, userId, userRole) => {
      if (app.status !== 'pending' || app.approvalFlow.length === 0) return false
      const firstPendingIdx = app.approvalFlow.findIndex(n => n.status === 'pending')
      if (firstPendingIdx < 0) return false
      const node = app.approvalFlow[firstPendingIdx]
      if (node.approverId === userId) return true
      if (userRole === 'manager' && node.role === '直属主管') return true
      if (userRole === 'manager' && node.role === '部门总监') return true
      if (userRole === 'finance' && node.role === '财务总监') return true
      if (userRole === 'admin') return true
      return false
    },

    addApplication: (app) => {
      const st = get()
      const applicant = st.employees.find(e => e.id === app.applicantId) || st.currentUser
      const days = calculateAllowanceDays(app.departureDate, app.returnDate)
      const rate = getDailyRate(app.destination, st.cityAllowances)
      const flow = generateApprovalFlow(applicant, app.estimatedCosts.total, st.employees)

      const existingIds = st.applications.map(a => parseInt(a.id.replace(/\D/g, ''), 10)).filter(n => !isNaN(n))
      const nextNum = (existingIds.length ? Math.max(...existingIds) : 0) + 1

      const newApp: TravelApplication = {
        ...app,
        id: `app-${String(nextNum).padStart(3, '0')}`,
        approvalFlow: flow,
        bookings: [],
        actualExpenses: null,
        overBudgetNote: null,
        dailyAllowance: {
          city: app.destination,
          dailyRate: rate,
          days,
          total: rate * days,
        },
        settlementStatus: 'unsettled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      set(state => {
        const next = [newApp, ...state.applications]
        saveToStorage(next)
        return { applications: next }
      })
    },

    updateApplicationStatus: (id, status) => {
      set(state => {
        const next = state.applications.map(app =>
          app.id === id ? { ...app, status, updatedAt: new Date().toISOString() } : app
        )
        saveToStorage(next)
        return { applications: next }
      })
    },

    approveApplication: (id, approverId, comment) => {
      set(state => {
        const next: TravelApplication[] = state.applications.map(app => {
          if (app.id !== id) return app
          const flow = [...app.approvalFlow]
          const pendingIdx = flow.findIndex(n => n.status === 'pending')
          if (pendingIdx < 0) return app
          flow[pendingIdx] = {
            ...flow[pendingIdx],
            status: 'approved',
            approverId: approverId || flow[pendingIdx].approverId,
            comment,
            timestamp: new Date().toISOString(),
          }
          const remainingPending = flow.findIndex(n => n.status === 'pending')
          const isFinal = remainingPending < 0
          return {
            ...app,
            status: (isFinal ? 'approved' : 'pending') as TravelApplication['status'],
            approvalFlow: flow,
            updatedAt: new Date().toISOString(),
          }
        })
        saveToStorage(next)
        return { applications: next }
      })
    },

    rejectApplication: (id, approverId, comment) => {
      set(state => {
        const next: TravelApplication[] = state.applications.map(app => {
          if (app.id !== id) return app
          const flow = [...app.approvalFlow]
          const pendingIdx = flow.findIndex(n => n.status === 'pending')
          if (pendingIdx >= 0) {
            flow[pendingIdx] = {
              ...flow[pendingIdx],
              status: 'rejected',
              approverId: approverId || flow[pendingIdx].approverId,
              comment,
              timestamp: new Date().toISOString(),
            }
          }
          return {
            ...app,
            status: 'rejected' as TravelApplication['status'],
            approvalFlow: flow,
            updatedAt: new Date().toISOString(),
          }
        })
        saveToStorage(next)
        return { applications: next }
      })
    },

    addBooking: (booking) => {
      const newBooking: BookingRecord = {
        ...booking,
        id: `bk-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: 'confirmed',
        bookedAt: new Date().toISOString(),
      }
      set(state => {
        const next = state.applications.map(app =>
          app.id === booking.applicationId
            ? { ...app, bookings: [...app.bookings, newBooking], updatedAt: new Date().toISOString() }
            : app
        )
        saveToStorage(next)
        return { applications: next }
      })
    },

    submitExpenses: (id, expenses, overBudgetNote) => {
      set(state => {
        const next = state.applications.map(app =>
          app.id === id
            ? { ...app, actualExpenses: expenses, overBudgetNote, updatedAt: new Date().toISOString() }
            : app
        )
        saveToStorage(next)
        return { applications: next }
      })
    },

    settleApplications: (ids) => {
      set(state => {
        const next: TravelApplication[] = state.applications.map(app =>
          ids.includes(app.id)
            ? { ...app, settlementStatus: 'settled' as TravelApplication['settlementStatus'], updatedAt: new Date().toISOString() }
            : app
        )
        saveToStorage(next)
        return { applications: next }
      })
    },

    returnApplication: (id) => {
      set(state => {
        const next: TravelApplication[] = state.applications.map(app =>
          app.id === id
            ? { ...app, settlementStatus: 'returned' as TravelApplication['settlementStatus'], updatedAt: new Date().toISOString() }
            : app
        )
        saveToStorage(next)
        return { applications: next }
      })
    },
  }
})
