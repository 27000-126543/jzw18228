import { useStore } from '@/store'
import { StatusBadge } from '@/components/StatusBadge'
import { Wallet, Clock, MapPin, AlertTriangle, Plus, Plane, FileText, ArrowRight, TrendingUp, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

const statCards = [
  { key: 'cost', label: '本月差旅总费用', icon: Wallet, gradient: 'from-navy-500 to-navy-700' },
  { key: 'pending', label: '待审批数', icon: Clock, gradient: 'from-navy-400 to-navy-600' },
  { key: 'ongoing', label: '进行中出差数', icon: MapPin, gradient: 'from-navy-500 to-navy-700' },
  { key: 'overBudget', label: '超预算申请数', icon: AlertTriangle, gradient: 'from-navy-400 to-navy-600' },
]

export default function Dashboard() {
  const applications = useStore(s => s.applications)
  const currentUser = useStore(s => s.currentUser)

  const myApps = applications.filter(a => a.applicantId === currentUser.id)
  const pendingCount = applications.filter(a => a.status === 'pending').length
  const ongoingCount = applications.filter(a => a.status === 'approved' && a.settlementStatus === 'unsettled').length
  const overBudgetCount = applications.filter(a => a.overBudgetNote).length
  const totalCost = myApps.reduce((sum, a) => sum + a.estimatedCosts.total, 0)

  const statValues: Record<string, { num: string; unit?: string }> = {
    cost: { num: `¥${totalCost.toLocaleString()}` },
    pending: { num: String(pendingCount), unit: '件' },
    ongoing: { num: String(ongoingCount), unit: '次' },
    overBudget: { num: String(overBudgetCount), unit: '件' },
  }

  const todoItems = myApps
    .filter(a => a.status === 'pending' || a.status === 'approved')
    .slice(0, 5)
    .map(a => ({
      id: a.id,
      type: a.status === 'pending' ? 'pending' as const : 'ongoing' as const,
      title: `${a.applicantName} - ${a.destination}`,
      destination: a.destination,
      date: a.departureDate,
      status: a.status,
    }))

  const dotColor = { pending: 'bg-amber-400', ongoing: 'bg-emerald-400' }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-500">工作台</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          const val = statValues[card.key]
          return (
            <div key={card.key} className={`rounded-xl bg-gradient-to-br ${card.gradient} p-5 text-white card-shadow`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm opacity-80">{card.label}</span>
                <Icon className="w-5 h-5 text-accent-400" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-mono font-medium tracking-tight">{val.num}</span>
                {val.unit && <span className="text-sm opacity-70">{val.unit}</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-navy-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-400" /> 待办事项
            </h2>
            <Link to="/applications" className="text-xs text-navy-300 hover:text-accent-400 flex items-center gap-1">
              查看全部 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {todoItems.length === 0 ? (
            <p className="text-surface-300 text-sm py-6 text-center">暂无待办事项</p>
          ) : (
            <ul className="divide-y divide-surface-50">
              {todoItems.map(item => (
                <li key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor[item.type]}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-navy-500 truncate">{item.title}</p>
                      <p className="text-xs text-surface-300">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={item.status} />
                    <Link
                      to={`/applications/${item.id}`}
                      className="text-xs text-accent-400 hover:text-accent-500 flex items-center gap-0.5"
                    >
                      处理 <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl card-shadow p-5">
          <h2 className="font-semibold text-navy-500 flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-accent-400" /> 快捷操作
          </h2>
          <div className="space-y-3">
            <Link
              to="/apply"
              className="flex items-center gap-3 w-full p-3 rounded-lg bg-gradient-to-r from-navy-500 to-navy-600 text-white hover:from-navy-600 hover:to-navy-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-accent-400" />
              <span className="text-sm">快速发起申请</span>
            </Link>
            <Link
              to="/book"
              className="flex items-center gap-3 w-full p-3 rounded-lg bg-gradient-to-r from-navy-400 to-navy-500 text-white hover:from-navy-500 hover:to-navy-600 transition-colors"
            >
              <Plane className="w-4 h-4 text-accent-400" />
              <span className="text-sm">快速预订</span>
            </Link>
            <Link
              to="/applications"
              className="flex items-center gap-3 w-full p-3 rounded-lg bg-gradient-to-r from-navy-500 to-navy-600 text-white hover:from-navy-600 hover:to-navy-700 transition-colors"
            >
              <FileText className="w-4 h-4 text-accent-400" />
              <span className="text-sm">查看我的申请</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
