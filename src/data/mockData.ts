import type { Employee, CityAllowance, ApprovalRoute, TravelApplication, ApprovalNode } from '@/types'

export const CURRENT_USER: Employee = {
  id: 'emp001',
  name: '张明',
  department: '技术研发部',
  level: 'P5',
  role: 'employee',
  managerId: 'emp010',
  avatar: '张',
}

export const EMPLOYEES: Employee[] = [
  CURRENT_USER,
  { id: 'emp002', name: '李芳', department: '市场营销部', level: 'P4', role: 'employee', managerId: 'emp011', avatar: '李' },
  { id: 'emp003', name: '王刚', department: '产品设计部', level: 'P6', role: 'employee', managerId: 'emp012', avatar: '王' },
  { id: 'emp004', name: '赵敏', department: '财务部', level: 'P5', role: 'finance', managerId: 'emp013', avatar: '赵' },
  { id: 'emp005', name: '陈伟', department: '人力资源部', level: 'P4', role: 'employee', managerId: 'emp011', avatar: '陈' },
  { id: 'emp006', name: '刘洋', department: '技术研发部', level: 'P7', role: 'employee', managerId: 'emp012', avatar: '刘' },
  { id: 'emp007', name: '孙丽', department: '市场营销部', level: 'P3', role: 'employee', managerId: 'emp010', avatar: '孙' },
  { id: 'emp008', name: '周磊', department: '产品设计部', level: 'P5', role: 'employee', managerId: 'emp012', avatar: '周' },
  { id: 'emp009', name: '吴静', department: '财务部', level: 'P6', role: 'finance', managerId: 'emp013', avatar: '吴' },
  { id: 'emp010', name: '郑军', department: '技术研发部', level: 'P8', role: 'manager', managerId: 'emp013', avatar: '郑' },
  { id: 'emp011', name: '黄芳', department: '市场营销部', level: 'P7', role: 'manager', managerId: 'emp013', avatar: '黄' },
  { id: 'emp012', name: '马超', department: '产品设计部', level: 'P8', role: 'manager', managerId: 'emp013', avatar: '马' },
  { id: 'emp013', name: '林总', department: '总裁办', level: 'P9', role: 'admin', managerId: '', avatar: '林' },
]

export const CITY_ALLOWANCES: CityAllowance[] = [
  { city: '北京', dailyRate: 500, tier: 'first' },
  { city: '上海', dailyRate: 500, tier: 'first' },
  { city: '广州', dailyRate: 450, tier: 'first' },
  { city: '深圳', dailyRate: 450, tier: 'first' },
  { city: '杭州', dailyRate: 400, tier: 'second' },
  { city: '成都', dailyRate: 350, tier: 'second' },
  { city: '武汉', dailyRate: 300, tier: 'second' },
  { city: '南京', dailyRate: 350, tier: 'second' },
  { city: '西安', dailyRate: 280, tier: 'third' },
  { city: '长沙', dailyRate: 260, tier: 'third' },
  { city: '重庆', dailyRate: 280, tier: 'third' },
  { city: '郑州', dailyRate: 240, tier: 'third' },
]

export const APPROVAL_ROUTES: ApprovalRoute[] = [
  { id: 'r1', name: '低金额常规审批', conditions: { maxAmount: 5000 }, approvers: ['direct_manager'] },
  { id: 'r2', name: '中金额主管审批', conditions: { minLevel: 'P6' }, approvers: ['department_director'] },
  { id: 'r3', name: '高金额联合审批', conditions: { maxAmount: 20000 }, approvers: ['department_director', 'finance_director'] },
]

const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '长沙']
const DEPARTMENTS = ['技术研发部', '市场营销部', '产品设计部', '财务部', '人力资源部']
const PURPOSES = [
  '客户项目交付与技术支持',
  '行业展会参展',
  '分公司业务协调',
  '供应商考察评估',
  '技术培训与交流',
  '市场调研与客户拜访',
  '产品上线保障',
  '年度审计配合',
  '新办公室选址考察',
  '合作伙伴签约',
]
const AIRLINES = [
  { airline: '中国国航', code: 'CA' },
  { airline: '东方航空', code: 'MU' },
  { airline: '南方航空', code: 'CZ' },
  { airline: '海南航空', code: 'HU' },
  { airline: '厦门航空', code: 'MF' },
]
const HOTEL_NAMES: Record<string, string[]> = {
  '北京': ['北京国际饭店', '北京华尔道夫', '北京王府井希尔顿'],
  '上海': ['上海外滩茂悦', '上海浦东香格里拉', '上海静安希尔顿'],
  '广州': ['广州白天鹅宾馆', '广州富力君悦', '广州白云国际会议中心'],
  '深圳': ['深圳福田香格里拉', '深圳华侨城洲际', '深圳前海JW万豪'],
  '杭州': ['杭州西湖国宾馆', '杭州黄龙饭店', '杭州洲际酒店'],
  '成都': ['成都钓鱼台酒店', '成都世纪城天堂洲际', '成都香格里拉'],
  '武汉': ['武汉光谷希尔顿', '武汉万达瑞华', '武汉洲际酒店'],
  '南京': ['南京金陵饭店', '南京绿地洲际', '南京世茂滨江希尔顿'],
  '西安': ['西安威斯汀', '西安皇冠假日', '西安喜来登'],
  '长沙': ['长沙瑞吉', '长沙W酒店', '长沙尼依格罗'],
}
const ROOM_TYPES = ['标准间', '大床房', '商务房', '行政房']

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateFlight(from: string, to: string, date: string) {
  const al = randomItem(AIRLINES)
  const hour = randomInt(6, 20)
  const dur = randomInt(2, 4)
  return {
    airline: al.airline,
    flightNo: `${al.code}${randomInt(1000, 9999)}`,
    departure: from,
    arrival: to,
    departureTime: `${date}T${String(hour).padStart(2, '0')}:${randomInt(0, 3) * 15 === 60 ? '45' : String(randomInt(0, 3) * 15).padStart(2, '0')}:00`,
    arrivalTime: `${date}T${String(hour + dur).padStart(2, '0')}:${randomInt(0, 3) * 15 === 60 ? '45' : String(randomInt(0, 3) * 15).padStart(2, '0')}:00`,
    price: randomInt(500, 3000),
  }
}

function generateHotel(city: string, checkIn: string, nights: number) {
  const names = HOTEL_NAMES[city] || ['中心大酒店', '商务宾馆']
  return {
    hotelName: randomItem(names),
    roomType: randomItem(ROOM_TYPES),
    checkIn,
    checkOut: checkIn,
    price: randomInt(300, 1200),
    nights,
    starRating: randomItem([4, 5]),
  }
}

export function generateMockApplications(): TravelApplication[] {
  const apps: TravelApplication[] = []
  const statuses: TravelApplication['status'][] = ['draft', 'pending', 'approved', 'rejected', 'cancelled', 'approved', 'approved', 'pending']
  const settlementStatuses: TravelApplication['settlementStatus'][] = ['unsettled', 'unsettled', 'settled', 'unsettled', 'settled']

  for (let i = 0; i < 15; i++) {
    const applicant = randomItem(EMPLOYEES.filter(e => e.role === 'employee'))
    const dest = randomItem(CITIES)
    const depMonth = randomInt(1, 6)
    const depDay = randomInt(1, 28)
    const dur = randomInt(2, 7)
    const depDate = `2025-${String(depMonth).padStart(2, '0')}-${String(depDay).padStart(2, '0')}`
    const retDate = `2025-${String(depMonth).padStart(2, '0')}-${String(depDay + dur).padStart(2, '0')}`
    const transport = randomInt(500, 4000)
    const accom = randomInt(300, 2000) * dur
    const meals = randomInt(100, 300) * dur
    const other = randomInt(0, 500)
    const total = transport + accom + meals + other
    const status = statuses[i % statuses.length]
    const allowance = CITY_ALLOWANCES.find(c => c.city === dest) || { city: dest, dailyRate: 300, tier: 'third' as const }

    const hasBookings = status === 'approved'
    const bookings = hasBookings ? [
      {
        id: `bk-f-${i}`,
        type: 'flight' as const,
        applicationId: `app-${String(i + 1).padStart(3, '0')}`,
        details: generateFlight('北京', dest, depDate),
        status: 'confirmed' as const,
        bookedAt: `2025-${String(depMonth).padStart(2, '0')}-${String(Math.max(1, depDay - 3)).padStart(2, '0')}T10:00:00`,
      },
      {
        id: `bk-h-${i}`,
        type: 'hotel' as const,
        applicationId: `app-${String(i + 1).padStart(3, '0')}`,
        details: generateHotel(dest, depDate, dur),
        status: 'confirmed' as const,
        bookedAt: `2025-${String(depMonth).padStart(2, '0')}-${String(Math.max(1, depDay - 2)).padStart(2, '0')}T14:00:00`,
      },
    ] : []

    const hasActual = status === 'approved' && Math.random() > 0.4
    const actualOverBudget = hasActual && Math.random() > 0.5
    const actualExpenses = hasActual ? {
      transportation: actualOverBudget ? transport + randomInt(200, 800) : transport - randomInt(0, 200),
      accommodation: actualOverBudget ? accom + randomInt(100, 500) : accom - randomInt(0, 300),
      meals: meals + randomInt(-50, 100),
      other: other + randomInt(-20, 100),
      total: 0,
    } : null

    if (actualExpenses) {
      actualExpenses.total = actualExpenses.transportation + actualExpenses.accommodation + actualExpenses.meals + actualExpenses.other
    }

    apps.push({
      id: `app-${String(i + 1).padStart(3, '0')}`,
      applicantId: applicant.id,
      applicantName: applicant.name,
      department: applicant.department,
      level: applicant.level,
      destination: dest,
      departureDate: depDate,
      returnDate: retDate,
      purpose: randomItem(PURPOSES),
      estimatedCosts: { transportation: transport, accommodation: accom, meals, other, total },
      status,
      approvalFlow: status === 'draft' ? [] : [
        {
          approverId: 'emp010',
          approverName: '郑军',
          role: '直属主管',
          status: (status === 'rejected' && i % 3 === 0 ? 'rejected' : 'approved') as ApprovalNode['status'],
          comment: status === 'rejected' && i % 3 === 0 ? '预算偏高，请优化行程' : '同意',
          timestamp: `2025-${String(depMonth).padStart(2, '0')}-${String(Math.max(1, depDay - 5)).padStart(2, '0')}T09:30:00`,
        },
        ...(total > 5000 ? [{
          approverId: 'emp013',
          approverName: '林总',
          role: '部门总监',
          status: status === 'rejected' && i % 5 === 0 ? 'rejected' : (status === 'pending' ? 'pending' as const : 'approved' as const),
          comment: status === 'rejected' && i % 5 === 0 ? '当前预算紧张，暂缓出差' : '批准出差申请',
          timestamp: `2025-${String(depMonth).padStart(2, '0')}-${String(Math.max(1, depDay - 4)).padStart(2, '0')}T15:00:00`,
        }] : []),
      ],
      bookings,
      actualExpenses,
      overBudgetNote: actualOverBudget ? '因客户临时调整需求，延长出差2天，住宿和交通费用相应增加' : null,
      dailyAllowance: {
        city: dest,
        dailyRate: allowance.dailyRate,
        days: dur,
        total: allowance.dailyRate * dur,
      },
      settlementStatus: hasActual && actualExpenses ? settlementStatuses[i % settlementStatuses.length] : 'unsettled',
      createdAt: `2025-${String(depMonth).padStart(2, '0')}-${String(Math.max(1, depDay - 7)).padStart(2, '0')}T10:00:00`,
      updatedAt: `2025-${String(depMonth).padStart(2, '0')}-${String(Math.max(1, depDay - 1)).padStart(2, '0')}T16:00:00`,
    })
  }

  return apps
}

export const MOCK_FLIGHTS = Array.from({ length: 8 }, (_, i) => {
  const al = AIRLINES[i % AIRLINES.length]
  const hour = 7 + i * 2
  return {
    id: `fl-${i + 1}`,
    airline: al.airline,
    flightNo: `${al.code}${1000 + i * 111}`,
    departure: '北京',
    arrival: CITIES[i % CITIES.length],
    departureTime: `2025-07-${String(15).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00`,
    arrivalTime: `2025-07-${String(15).padStart(2, '0')}T${String(hour + 3).padStart(2, '0')}:30:00`,
    price: 600 + i * 350,
  }
})

export const MOCK_HOTELS = Array.from({ length: 8 }, (_, i) => {
  const city = CITIES[i % CITIES.length]
  const names = HOTEL_NAMES[city] || ['中心大酒店']
  return {
    id: `ht-${i + 1}`,
    hotelName: names[i % names.length],
    city,
    starRating: i % 2 === 0 ? 5 : 4,
    roomType: ROOM_TYPES[i % ROOM_TYPES.length],
    price: 400 + i * 150,
    rating: (4 + Math.random()).toFixed(1),
  }
})
