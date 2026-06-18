import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, CheckSquare, Plane, Receipt, Banknote, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '工作台' },
  { path: '/applications', icon: FileText, label: '差旅申请' },
  { path: '/approvals', icon: CheckSquare, label: '审批中心' },
  { path: '/bookings', icon: Plane, label: '预订中心' },
  { path: '/expenses', icon: Receipt, label: '费用报销' },
  { path: '/settlements', icon: Banknote, label: '财务核销' },
  { path: '/analytics', icon: BarChart3, label: '数据分析' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-navy-500 nav-shadow z-50 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-[68px]' : 'w-[220px]'
      }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-navy-400/30">
        <div className="w-8 h-8 rounded-lg bg-accent-400 flex items-center justify-center flex-shrink-0">
          <Plane className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="ml-3 text-white font-bold text-base tracking-wide whitespace-nowrap">
            差旅管理
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center h-11 mx-2 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-navy-200 hover:bg-white/8 hover:text-white'
              }`}
            >
              <div className={`flex items-center justify-center w-[52px] flex-shrink-0`}>
                <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-accent-400' : ''}`} />
              </div>
              {!collapsed && (
                <span className="text-sm whitespace-nowrap">{item.label}</span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t border-navy-400/30 text-navy-200 hover:text-white hover:bg-white/8 transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  )
}
