import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useStore } from '@/store'
import { Bell, Search, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { Employee } from '@/types'

const ROLE_LABEL: Record<Employee['role'], string> = {
  employee: '普通员工',
  manager: '部门主管',
  finance: '财务人员',
  admin: '系统管理员',
}

const ROLE_COLOR: Record<Employee['role'], string> = {
  employee: 'bg-navy-100 text-navy-500',
  manager: 'bg-emerald-100 text-emerald-600',
  finance: 'bg-accent-100 text-accent-500',
  admin: 'bg-purple-100 text-purple-600',
}

export default function Layout() {
  const currentUser = useStore(s => s.currentUser)
  const employees = useStore(s => s.employees)
  const setCurrentUser = useStore(s => s.setCurrentUser)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const approvers = employees.filter(e => e.role !== 'employee' || e.id === 'emp001')

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <div className="ml-[220px] transition-all duration-300">
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-surface-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-300" />
              <input
                type="text"
                placeholder="搜索申请单、目的地..."
                className="pl-9 pr-4 py-2 bg-surface-50 rounded-lg text-sm border border-transparent focus:border-navy-300 focus:bg-white focus:outline-none w-72 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-surface-300 hover:text-navy-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>

            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-surface-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 text-white flex items-center justify-center text-sm font-semibold">
                  {currentUser.avatar}
                </div>
                <div className="text-left">
                  <div className="text-sm">
                    <span className="text-navy-500 font-medium">{currentUser.name}</span>
                    <span className="text-surface-300 ml-2">{currentUser.level}</span>
                  </div>
                  <span className={`inline-block px-1.5 py-px rounded text-[10px] ${ROLE_COLOR[currentUser.role]}`}>
                    {ROLE_LABEL[currentUser.role]}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-surface-300 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl card-shadow overflow-hidden border border-surface-100 z-50">
                  <div className="px-4 py-2.5 bg-navy-50 border-b border-surface-100">
                    <p className="text-xs text-navy-500 font-semibold">切换身份以体验不同角色</p>
                    <p className="text-[10px] text-surface-300 mt-0.5">演示审批闭环可切换到主管/总监/财务</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {approvers.map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => { setCurrentUser(emp.id); setOpen(false) }}
                        className={`w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-surface-50 transition-colors ${
                          emp.id === currentUser.id ? 'bg-navy-50' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                          emp.id === currentUser.id
                            ? 'bg-accent-400 text-white'
                            : 'bg-gradient-to-br from-navy-100 to-navy-200 text-navy-500'
                        }`}>
                          {emp.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-navy-500 font-medium truncate">{emp.name}</span>
                            <span className="text-[10px] text-surface-300">{emp.level}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-block px-1.5 py-px rounded text-[10px] ${ROLE_COLOR[emp.role]}`}>
                              {ROLE_LABEL[emp.role]}
                            </span>
                            <span className="text-[10px] text-surface-300 truncate">{emp.department}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
