import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { SettlementBadge } from '@/components/StatusBadge'
import { Receipt, AlertTriangle, CheckCircle, DollarSign, Calculator } from 'lucide-react'
import { format } from 'date-fns'
import type { CostBreakdown, SettlementStatus } from '@/types'

const FILTER_TABS: { key: SettlementStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'unsettled', label: '待核销' },
  { key: 'settled', label: '已核销' },
  { key: 'returned', label: '已退回' },
]

export default function Expenses() {
  const applications = useStore(s => s.applications)
  const submitExpenses = useStore(s => s.submitExpenses)
  const currentUser = useStore(s => s.currentUser)

  const [selectedId, setSelectedId] = useState('')
  const [actual, setActual] = useState({ transportation: 0, accommodation: 0, meals: 0, other: 0 })
  const [overBudgetNote, setOverBudgetNote] = useState('')
  const [filter, setFilter] = useState<SettlementStatus | 'all'>('all')

  const eligible = useMemo(() =>
    applications.filter(a => a.status === 'approved' && !a.actualExpenses && a.applicantId === currentUser.id),
    [applications, currentUser.id]
  )

  const selected = applications.find(a => a.id === selectedId)
  const actualTotal = actual.transportation + actual.accommodation + actual.meals + actual.other
  const estimatedTotal = selected?.estimatedCosts.total ?? 0
  const isOverBudget = selected && actualTotal > estimatedTotal

  const filtered = useMemo(() => {
    const mine = applications.filter(a => a.applicantId === currentUser.id && a.actualExpenses)
    return filter === 'all' ? mine : mine.filter(a => a.settlementStatus === filter)
  }, [applications, currentUser.id, filter])

  const handleSubmit = () => {
    if (!selectedId || !selected) return
    if (isOverBudget && !overBudgetNote.trim()) return
    const expenses: CostBreakdown = { ...actual, total: actualTotal }
    submitExpenses(selectedId, expenses, isOverBudget ? overBudgetNote : null)
    setSelectedId('')
    setActual({ transportation: 0, accommodation: 0, meals: 0, other: 0 })
    setOverBudgetNote('')
  }

  const fmt = (n: number) => `¥${n.toLocaleString()}`

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
        <h2 className="text-lg font-semibold text-navy-500 flex items-center gap-2 mb-4">
          <Receipt className="w-5 h-5" /> 提交费用
        </h2>

        <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
          className="w-full border border-surface-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-accent-400">
          <option value="">-- 请选择已通过的出差申请 --</option>
          {eligible.map(a => (
            <option key={a.id} value={a.id}>{a.id} - {a.destination} ({a.departureDate}~{a.returnDate})</option>
          ))}
        </select>

        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-surface-50 rounded-lg p-3">
                <span className="text-surface-400">目的地</span>
                <p className="font-medium text-navy-500">{selected.destination}</p>
              </div>
              <div className="bg-surface-50 rounded-lg p-3">
                <span className="text-surface-400">出行日期</span>
                <p className="font-medium text-navy-500">{format(new Date(selected.departureDate), 'MM/dd')}~{format(new Date(selected.returnDate), 'MM/dd')}</p>
              </div>
              <div className="bg-surface-50 rounded-lg p-3">
                <span className="text-surface-400">预估费用</span>
                <p className="font-medium text-navy-500"><DollarSign className="w-3.5 h-3.5 inline" />{fmt(estimatedTotal)}</p>
              </div>
              <div className="bg-surface-50 rounded-lg p-3">
                <span className="text-surface-400">出差补贴</span>
                <p className="font-medium text-navy-500">{selected.dailyAllowance.city} ¥{selected.dailyAllowance.dailyRate}/天 × {selected.dailyAllowance.days}天 = ¥{selected.dailyAllowance.total}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['transportation', 'accommodation', 'meals', 'other'] as const).map(key => (
                <div key={key}>
                  <label className="text-xs text-surface-400">{({ transportation: '交通费', accommodation: '住宿费', meals: '餐费', other: '其他' })[key]}</label>
                  <input type="number" min={0} value={actual[key] || ''} onChange={e => setActual(p => ({ ...p, [key]: +e.target.value }))}
                    className="w-full border border-surface-300 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-accent-400" placeholder="0" />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Calculator className="w-4 h-4 text-surface-400" />
              <span>实际合计: <strong className={isOverBudget ? 'text-red-600' : 'text-emerald-600'}>{fmt(actualTotal)}</strong></span>
              {isOverBudget && (
                <span className="flex items-center gap-1 text-red-600 font-medium"><AlertTriangle className="w-4 h-4" /> 超出预算 {fmt(actualTotal - estimatedTotal)}</span>
              )}
              {!isOverBudget && actualTotal > 0 && (
                <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-4 h-4" /> 预算内</span>
              )}
            </div>

            {isOverBudget && (
              <div>
                <label className="text-xs text-red-600 font-medium">超出预算说明（必填）</label>
                <textarea value={overBudgetNote} onChange={e => setOverBudgetNote(e.target.value)} rows={2}
                  className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-red-400" placeholder="请说明超出预算的原因..." />
              </div>
            )}

            <button onClick={handleSubmit} disabled={!selectedId || (isOverBudget && !overBudgetNote.trim())}
              className="bg-accent-400 hover:bg-accent-500 disabled:bg-surface-300 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              提交报销
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-200 p-6">
        <h2 className="text-lg font-semibold text-navy-500 flex items-center gap-2 mb-4">
          <Receipt className="w-5 h-5" /> 报销列表
        </h2>

        <div className="flex gap-1 mb-4">
          {FILTER_TABS.map(t => (
            <button key={t.key} onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === t.key ? 'bg-navy-500 text-white' : 'bg-surface-100 text-surface-400 hover:bg-surface-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200 text-surface-400 text-left">
                <th className="pb-2 font-medium">申请单号</th>
                <th className="pb-2 font-medium">目的地</th>
                <th className="pb-2 font-medium">出行日期</th>
                <th className="pb-2 font-medium">预估费用</th>
                <th className="pb-2 font-medium">实际费用</th>
                <th className="pb-2 font-medium">补贴金额</th>
                <th className="pb-2 font-medium">核销状态</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-surface-100 hover:bg-surface-50 cursor-pointer">
                  <td className="py-2.5"><Link to={`/applications/${a.id}`} className="text-accent-400 hover:underline">{a.id}</Link></td>
                  <td className="py-2.5">{a.destination}</td>
                  <td className="py-2.5">{format(new Date(a.departureDate), 'yyyy-MM-dd')}</td>
                  <td className="py-2.5">{fmt(a.estimatedCosts.total)}</td>
                  <td className="py-2.5">{a.actualExpenses ? fmt(a.actualExpenses.total) : '-'}</td>
                  <td className="py-2.5">{fmt(a.dailyAllowance.total)}</td>
                  <td className="py-2.5"><SettlementBadge status={a.settlementStatus} /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-surface-400">暂无报销记录</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
